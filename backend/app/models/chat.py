from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class ConversationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    ESCALATED = "ESCALATED"
    ABANDONED = "ABANDONED"

class MessageSender(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    AI = "AI"
    AGENT = "AGENT"
    SYSTEM = "SYSTEM"

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    session_id = Column(String(200), nullable=True)  # Browser session tracking
    
    # Conversation Details
    status = Column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE)
    topic = Column(String(200), nullable=True)  # Main topic detected by AI
    intent = Column(String(100), nullable=True)  # refund, return, order_status, product_inquiry
    
    # Escalation
    escalated_to_ticket_id = Column(String, ForeignKey("tickets.id"), nullable=True)
    escalated_to_agent_id = Column(Integer, ForeignKey("agents.user_id"), nullable=True)
    escalation_reason = Column(Text, nullable=True)
    
    # Satisfaction
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5
    feedback = Column(Text, nullable=True)
    
    # Metadata
    started_at = Column(DateTime, server_default=func.now())
    ended_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    message_count = Column(Integer, default=0)
    
    # Relationships
    customer = relationship("Customer")
    messages = relationship("ChatMessage", back_populates="conversation")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    conversation_id = Column(String, ForeignKey("chat_conversations.id"), nullable=False)
    sender_type = Column(Enum(MessageSender), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL for AI/SYSTEM
    
    # Message Content
    content = Column(Text, nullable=False)
    content_type = Column(String(50), default="TEXT")  # TEXT, IMAGE, FILE, QUICK_REPLY
    
    # AI Analysis
    intent = Column(String(100), nullable=True)  # Detected intent
    intent_confidence = Column(Float, nullable=True)
    entities = Column(JSON, nullable=True)  # Extracted entities (order_id, product_name, etc.)
    sentiment = Column(String(20), nullable=True)  # POSITIVE, NEUTRAL, NEGATIVE
    sentiment_score = Column(Float, nullable=True)
    
    # AI Response Generation
    ai_model_used = Column(String(100), nullable=True)  # gpt-4, claude, etc.
    ai_confidence = Column(Float, nullable=True)
    rag_sources = Column(JSON, nullable=True)  # Knowledge base articles used
    response_time_ms = Column(Integer, nullable=True)
    
    # Feedback
    helpful = Column(Boolean, nullable=True)
    feedback_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    conversation = relationship("ChatConversation", back_populates="messages")
    sender = relationship("User")

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Refund Policy, Return Policy, Shipping, Product Info
    subcategory = Column(String(100), nullable=True)
    
    # Search & Retrieval
    tags = Column(JSON, nullable=True)  # Array of tags for better search
    keywords = Column(JSON, nullable=True)  # Key terms for matching
    embedding_vector = Column(Text, nullable=True)  # Vector embedding for RAG (stored as JSON string)
    
    # Usage Metrics
    view_count = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    used_in_chat_count = Column(Integer, default=0)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # Higher priority shown first
    language = Column(String(10), default="en")
    
    # Authoring
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    last_reviewed_at = Column(DateTime, nullable=True)

class FAQItem(Base):
    __tablename__ = "faq_items"

    id = Column(Integer, primary_key=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    
    # Auto-generation
    auto_generated = Column(Boolean, default=False)
    source_ticket_ids = Column(JSON, nullable=True)  # Tickets this was learned from
    confidence_score = Column(Float, nullable=True)
    
    # Usage
    view_count = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    reviewed = Column(Boolean, default=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
