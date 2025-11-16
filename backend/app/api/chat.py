"""
Chat API endpoints for RAG-based conversational support
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.chat import ChatConversation, ChatMessage
from app.models.user import User
from app.models.refund import ImageAnalysis
from app.services.rag_service import get_rag_service
from app.services.vision_service import get_vision_service
from app.services.refund_eligibility_service import get_eligibility_service
from app.services.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


# Request/Response Models
class StartChatRequest(BaseModel):
    initial_message: Optional[str] = None


class ChatMessageRequest(BaseModel):
    conversation_id: int
    message: str
    category_filter: Optional[str] = None


class ChatFeedbackRequest(BaseModel):
    message_id: int
    rating: int  # 1-5
    feedback_text: Optional[str] = None


class EscalateRequest(BaseModel):
    conversation_id: int
    reason: str


class ImageVerificationRequest(BaseModel):
    product_description: str
    order_id: Optional[int] = None


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    content: str
    sender_type: str
    rag_sources: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    customer_id: int
    status: str
    started_at: datetime
    last_activity_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/start", response_model=ConversationResponse)
async def start_chat(
    request: StartChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start a new chat conversation
    """
    try:
        # Create new conversation
        conversation = ChatConversation(
            customer_id=current_user.id,
            status="ACTIVE"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        # If initial message provided, process it
        if request.initial_message:
            rag_service = get_rag_service()
            
            # Save customer message
            customer_msg = ChatMessage(
                conversation_id=conversation.id,
                content=request.initial_message,
                sender_type="CUSTOMER"
            )
            db.add(customer_msg)
            db.commit()
            
            # Generate AI response
            if rag_service.is_available():
                result = rag_service.answer_question(request.initial_message)
                
                ai_msg = ChatMessage(
                    conversation_id=conversation.id,
                    content=result['response'],
                    sender_type="AI",
                    rag_sources=result['sources'] if result['sources'] else None
                )
                db.add(ai_msg)
                db.commit()
            else:
                # Fallback message
                ai_msg = ChatMessage(
                    conversation_id=conversation.id,
                    content="Hello! I'm here to help. However, I'm currently experiencing technical difficulties. Please try again in a moment or contact our support team directly.",
                    sender_type="AI"
                )
                db.add(ai_msg)
                db.commit()
        
        return conversation
        
    except Exception as e:
        logger.error(f"Error starting chat: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to start chat")


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message in an existing conversation
    """
    try:
        # Verify conversation exists and belongs to user
        conversation = db.query(ChatConversation).filter(
            ChatConversation.id == request.conversation_id,
            ChatConversation.customer_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Conversation is not active")
        
        # Save customer message
        customer_msg = ChatMessage(
            conversation_id=conversation.id,
            content=request.message,
            sender_type="CUSTOMER"
        )
        db.add(customer_msg)
        db.commit()
        
        # Get conversation history
        history = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation.id
        ).order_by(ChatMessage.created_at.desc()).limit(10).all()
        
        history_list = [
            {"role": msg.sender_type, "content": msg.content}
            for msg in reversed(history)
        ]
        
        # Generate AI response
        rag_service = get_rag_service()
        
        if rag_service.is_available():
            result = rag_service.answer_question(
                request.message,
                conversation_history=history_list,
                category_filter=request.category_filter
            )
            
            ai_msg = ChatMessage(
                conversation_id=conversation.id,
                content=result['response'],
                sender_type="AI",
                rag_sources=result['sources'] if result['sources'] else None
            )
        else:
            ai_msg = ChatMessage(
                conversation_id=conversation.id,
                content="I apologize, but I'm currently unable to process your request. Please try again later or contact our support team.",
                sender_type="AI"
            )
        
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        
        # Update conversation timestamp
        conversation.last_activity_at = datetime.utcnow()
        db.commit()
        
        return ai_msg
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.get("/history/{conversation_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    conversation_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get conversation history
    """
    # Verify conversation belongs to user
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.customer_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at.asc()).limit(limit).all()
    
    return messages


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's chat conversations
    """
    conversations = db.query(ChatConversation).filter(
        ChatConversation.customer_id == current_user.id
    ).order_by(ChatConversation.updated_at.desc()).limit(limit).all()
    
    return conversations


@router.post("/escalate")
async def escalate_to_agent(
    request: EscalateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Escalate conversation to human agent
    """
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == request.conversation_id,
        ChatConversation.customer_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.status = "ESCALATED"
    conversation.escalation_reason = request.reason
    conversation.ended_at = datetime.utcnow()
    
    # Add system message
    system_msg = ChatMessage(
        conversation_id=conversation.id,
        content=f"Conversation escalated to human agent. Reason: {request.reason}",
        sender_type="SYSTEM"
    )
    db.add(system_msg)
    db.commit()
    
    return {"success": True, "message": "Conversation escalated to agent"}


@router.post("/feedback")
async def submit_feedback(
    request: ChatFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback for an AI response
    """
    message = db.query(ChatMessage).filter(
        ChatMessage.id == request.message_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Verify message belongs to user's conversation
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == message.conversation_id,
        ChatConversation.customer_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=403, detail="Access denied")
    
    message.helpful = request.rating >= 4
    message.feedback_reason = request.feedback_text
    db.commit()
    
    return {"success": True, "message": "Feedback submitted"}


@router.post("/verify-image")
async def verify_return_image(
    file: UploadFile = File(...),
    product_description: str = "",
    order_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze uploaded image for refund verification
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Analyze image
        vision_service = get_vision_service()
        
        if not vision_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Image analysis service temporarily unavailable"
            )
        
        result = vision_service.analyze_product_image(
            image_bytes,
            product_description
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Analysis failed'))
        
        # Save analysis to database
        # Note: return_request_id should be provided, using placeholder for now
        analysis = ImageAnalysis(
            return_request_id=str(order_id) if order_id else "temp",
            image_url=f"uploads/{file.filename}",
            analysis_status="COMPLETED",
            product_detected=True,
            condition_score=result['condition']['confidence'] * 100,
            damage_detected='damaged' in result['condition']['assessment'].lower(),
            ai_description=result['condition']['assessment'],
            detected_objects=result['condition']['all_scores'],
            fraud_indicators=result['recommendations'],
            fraud_confidence=result['fraud_score'] / 100.0,
            analyzed_at=datetime.utcnow()
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return {
            "success": True,
            "analysis_id": analysis.id,
            "condition": result['condition'],
            "authenticity": result['authenticity'],
            "fraud_score": result['fraud_score'],
            "risk_level": result['risk_level'],
            "recommendations": result['recommendations']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze image")


@router.get("/health")
async def chat_health():
    """
    Check health of chat services
    """
    rag_service = get_rag_service()
    vision_service = get_vision_service()
    
    return {
        "rag_available": rag_service.is_available(),
        "vision_available": vision_service.is_available(),
        "status": "healthy" if rag_service.is_available() else "degraded"
    }


@router.post("/index-knowledge-base")
async def index_knowledge_base(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Index knowledge base articles (admin only)
    """
    # TODO: Add admin role check
    
    rag_service = get_rag_service()
    result = rag_service.index_knowledge_base()
    
    return result


# Refund Eligibility Endpoints

class RefundEligibilityRequest(BaseModel):
    product_category: str
    purchase_date: str  # ISO format date
    reason: str
    condition: str = "unused"
    has_packaging: bool = True
    has_receipt: bool = True
    additional_info: Optional[str] = None


@router.post("/check-refund-eligibility")
async def check_refund_eligibility(
    request: RefundEligibilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if customer is eligible for refund based on policies
    Uses RAG to analyze against company policies
    """
    try:
        eligibility_service = get_eligibility_service()
        
        # Parse purchase date
        purchase_date = datetime.fromisoformat(request.purchase_date.replace('Z', '+00:00'))
        
        # Check eligibility
        result = eligibility_service.check_eligibility(
            product_category=request.product_category,
            purchase_date=purchase_date,
            reason=request.reason,
            condition=request.condition,
            has_packaging=request.has_packaging,
            has_receipt=request.has_receipt,
            additional_info=request.additional_info
        )
        
        return {
            "success": True,
            "eligibility": result
        }
        
    except Exception as e:
        logger.error(f"Error checking eligibility: {e}")
        raise HTTPException(status_code=500, detail="Failed to check eligibility")


@router.get("/return-window/{category}")
async def get_return_window(
    category: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get return window information for a product category
    """
    try:
        eligibility_service = get_eligibility_service()
        result = eligibility_service.get_return_window(category)
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting return window: {e}")
        raise HTTPException(status_code=500, detail="Failed to get return window")


@router.post("/explain-rejection")
async def explain_rejection(
    product_category: str,
    days_since_purchase: int,
    reason: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get customer-friendly explanation for why a return might be rejected
    """
    try:
        eligibility_service = get_eligibility_service()
        explanation = eligibility_service.explain_rejection(
            product_category=product_category,
            days_since_purchase=days_since_purchase,
            reason=reason
        )
        
        return {
            "explanation": explanation
        }
        
    except Exception as e:
        logger.error(f"Error explaining rejection: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate explanation")
