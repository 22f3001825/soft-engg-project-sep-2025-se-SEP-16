"""
AI Copilot Service
Main orchestration service for AI Copilot features
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import json
import logging

from app.models.ticket import Ticket, Message
from app.models.ai_copilot import TicketSummary, SuggestedResponse, RefundExplanation
from app.models.refund import RefundRequest, FraudCheck
from app.models.user import User
from app.services.llm_service import llm_service
from app.services.knowledge_loader import knowledge_loader

logger = logging.getLogger(__name__)

class CopilotService:
    def __init__(self):
        self.llm = llm_service
        self.kb = knowledge_loader
        self.kb.load_all_documents()
    
    def generate_ticket_summary(self, ticket: Ticket, messages: List[Message], db: Session) -> Dict:
        """
        Generate AI summary for a ticket
        Returns summary with key points, sentiment, and urgency
        """
        
        conversation = self._format_conversation(messages)
        
        system_prompt = """You are an expert customer support analyst who creates insightful ticket summaries for support agents."""
        
        prompt = f"""Read this support ticket and create a concise summary that helps the agent understand the situation quickly.

Ticket Subject: {ticket.subject}
Ticket ID: {ticket.id}
Status: {ticket.status.value if hasattr(ticket.status, 'value') else ticket.status}
Priority: {ticket.priority.value if hasattr(ticket.priority, 'value') else ticket.priority}

Conversation:
{conversation}

Create a JSON response with:
1. summary: Write 2-3 sentences explaining what the customer needs and why (synthesize the core issue)
2. key_points: List 3-5 important insights from the conversation (what matters most)
3. customer_sentiment: Analyze the customer's tone - POSITIVE, NEUTRAL, or NEGATIVE
4. urgency_level: Assess how urgent this is - LOW, MEDIUM, HIGH, or CRITICAL
5. detected_category: Categorize as Billing, Technical, Product, Shipping, Refund, or Other
6. suggested_actions: Recommend 2-3 specific next steps for the agent

Respond with valid JSON only."""

        result = self.llm.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=800
        )
        
        if not result['success']:
            logger.warning(f"LLM generation failed for ticket {ticket.id}, using fallback. Model: {result.get('model', 'unknown')}")
            return self._fallback_summary(ticket, messages)
        
        try:
            # Clean and parse JSON response
            cleaned_text = self._clean_json_response(result['text'])
            summary_data = json.loads(cleaned_text)
            logger.info(f"Successfully generated AI summary for ticket {ticket.id} using {result['model']}")
        except Exception as e:
            logger.error(f"Failed to parse JSON from LLM response for ticket {ticket.id}: {e}. Response: {result['text'][:200]}")
            summary_data = self._parse_summary_fallback(result['text'], ticket, messages)
        
        summary_data['model_used'] = result['model']
        summary_data['generation_time_ms'] = result['generation_time_ms']
        summary_data['confidence_score'] = 0.85 if result['success'] else 0.5
        
        return summary_data
    
    def generate_response_suggestions(
        self, 
        ticket: Ticket, 
        messages: List[Message],
        customer: User,
        db: Session
    ) -> List[Dict]:
        """
        Generate suggested responses for agents
        Returns list of suggested responses with reasoning
        """
        
        conversation = self._format_conversation(messages)
        
        relevant_docs = self.kb.search_documents(ticket.subject)[:3]
        context = self._format_knowledge_context(relevant_docs)
        
        system_prompt = """You are an expert customer support agent. 
Generate professional, empathetic responses based on company policies and best practices."""
        
        prompt = f"""Generate a professional response for this customer support ticket.

Customer Name: {customer.full_name}
Ticket Subject: {ticket.subject}
Current Status: {ticket.status.value if hasattr(ticket.status, 'value') else ticket.status}

Recent Conversation:
{conversation}

Relevant Company Policies:
{context}

Generate 2 response suggestions:
1. A solution-focused response (if issue can be resolved)
2. A clarification response (if more information needed)

For each response, provide:
- response_text: The actual response message
- response_type: SOLUTION, CLARIFICATION, ESCALATION, or CLOSING
- reasoning: Why this response is appropriate
- confidence: 0.0 to 1.0

Format as JSON array."""

        result = self.llm.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=1200
        )
        
        if not result['success']:
            return self._fallback_suggestions(ticket, customer)
        
        try:
            cleaned_text = self._clean_json_response(result['text'])
            suggestions = json.loads(cleaned_text)
            if not isinstance(suggestions, list):
                suggestions = [suggestions]
        except:
            suggestions = self._parse_suggestions_fallback(result['text'])
        
        for suggestion in suggestions:
            suggestion['model_used'] = result['model']
            suggestion['generation_time_ms'] = result['generation_time_ms']
            suggestion['based_on_kb_articles'] = [doc['title'] for doc in relevant_docs]
        
        return suggestions
    
    def generate_refund_explanation(
        self,
        refund_request: RefundRequest,
        fraud_check: Optional[FraudCheck],
        db: Session
    ) -> Dict:
        """
        Generate natural language explanation for refund decision
        Returns both agent-facing and customer-facing explanations
        """
        
        relevant_docs = self.kb.search_documents("refund policy approval")[:2]
        policy_context = self._format_knowledge_context(relevant_docs)
        
        fraud_info = ""
        if fraud_check:
            fraud_info = f"""
Fraud Analysis:
- Risk Level: {fraud_check.risk_level.value if hasattr(fraud_check.risk_level, 'value') else fraud_check.risk_level}
- Fraud Score: {fraud_check.fraud_score}/100
- Indicators: {json.dumps(fraud_check.fraud_indicators) if fraud_check.fraud_indicators else 'None'}
"""
        
        system_prompt = """You are a customer support supervisor explaining refund decisions.
Be clear, professional, and reference specific policies."""
        
        prompt = f"""Explain this refund decision in clear language.

Refund Request:
- Amount: ${refund_request.amount}
- Reason: {refund_request.reason}
- Status: {refund_request.status.value if hasattr(refund_request.status, 'value') else refund_request.status}
- AI Recommendation: {refund_request.ai_recommendation or 'N/A'}
- AI Eligibility: {refund_request.ai_eligibility_reason or 'N/A'}

{fraud_info}

Company Policies:
{policy_context}

Provide:
1. decision: APPROVED, REJECTED, or NEEDS_REVIEW
2. agent_explanation: Detailed technical explanation for agents (2-3 sentences)
3. customer_explanation: Simple, friendly explanation for customers (2-3 sentences)
4. reasoning_points: Array of 3-5 specific reasons
5. policy_references: Array of relevant policy sections mentioned
6. next_steps: Array of 2-3 action items

Format as valid JSON."""

        result = self.llm.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=1000
        )
        
        if not result['success']:
            return self._fallback_explanation(refund_request, fraud_check)
        
        try:
            cleaned_text = self._clean_json_response(result['text'])
            explanation = json.loads(cleaned_text)
        except:
            explanation = self._parse_explanation_fallback(result['text'], refund_request)
        
        explanation['model_used'] = result['model']
        explanation['confidence_score'] = 0.8 if result['success'] else 0.5
        
        return explanation
    
    def _format_conversation(self, messages: List[Message]) -> str:
        """Format messages into readable conversation"""
        formatted = []
        for msg in messages[-10:]:
            sender = "Customer" if msg.sender_id else "Agent"
            formatted.append(f"{sender}: {msg.content}")
        return "\n".join(formatted)
    
    def _format_knowledge_context(self, documents: List[Dict]) -> str:
        """Format knowledge base documents as context"""
        if not documents:
            return "No specific policies found."
        
        formatted = []
        for doc in documents:
            formatted.append(f"[{doc['title']}]\n{doc['content'][:500]}...")
        return "\n\n".join(formatted)
    
    def _fallback_summary(self, ticket: Ticket, messages: List[Message]) -> Dict:
        """Fallback summary when LLM unavailable"""
        return {
            "summary": f"Ticket regarding: {ticket.subject}. Contains {len(messages)} messages.",
            "key_points": [
                f"Subject: {ticket.subject}",
                f"Status: {ticket.status.value if hasattr(ticket.status, 'value') else ticket.status}",
                f"Messages: {len(messages)}"
            ],
            "customer_sentiment": "NEUTRAL",
            "urgency_level": ticket.priority.value if hasattr(ticket.priority, 'value') else "MEDIUM",
            "detected_category": "General",
            "suggested_actions": ["Review ticket details", "Respond to customer"],
            "model_used": "fallback_summary",
            "generation_time_ms": 0,
            "confidence_score": 0.3
        }
    
    def _fallback_suggestions(self, ticket: Ticket, customer: User) -> List[Dict]:
        """Fallback suggestions when LLM unavailable"""
        return [{
            "response_text": f"Thank you for contacting us, {customer.full_name}. I'm reviewing your ticket regarding {ticket.subject} and will provide a detailed response shortly.",
            "response_type": "ACKNOWLEDGMENT",
            "reasoning": "Standard acknowledgment response",
            "confidence": 0.5,
            "model_used": "fallback",
            "generation_time_ms": 0
        }]
    
    def _fallback_explanation(self, refund_request: RefundRequest, fraud_check: Optional[FraudCheck]) -> Dict:
        """Fallback explanation when LLM unavailable"""
        status = refund_request.status.value if hasattr(refund_request.status, 'value') else refund_request.status
        
        return {
            "decision": status.upper(),
            "agent_explanation": f"Refund request for ${refund_request.amount} is currently {status}.",
            "customer_explanation": f"Your refund request has been {status.lower()}.",
            "reasoning_points": [refund_request.reason],
            "policy_references": [],
            "next_steps": ["Review will be completed within 24 hours"],
            "model_used": "fallback",
            "confidence_score": 0.3
        }
    
    def _parse_summary_fallback(self, text: str, ticket: Ticket, messages: List[Message]) -> Dict:
        """Parse summary from non-JSON LLM response"""
        return self._fallback_summary(ticket, messages)
    
    def _parse_suggestions_fallback(self, text: str) -> List[Dict]:
        """Parse suggestions from non-JSON LLM response"""
        return [{
            "response_text": text[:500] if text else "I'm reviewing your request and will respond shortly.",
            "response_type": "SOLUTION",
            "reasoning": "Generated from LLM",
            "confidence": 0.6
        }]
    
    def _parse_explanation_fallback(self, text: str, refund_request: RefundRequest) -> Dict:
        """Parse explanation from non-JSON LLM response"""
        return {
            "decision": "NEEDS_REVIEW",
            "agent_explanation": text[:300] if text else "Refund under review.",
            "customer_explanation": "Your refund request is being reviewed by our team.",
            "reasoning_points": [refund_request.reason],
            "policy_references": [],
            "next_steps": ["Review in progress"]
        }
    
    def _clean_json_response(self, text: str) -> str:
        """Clean LLM response to extract valid JSON"""
        import html
        
        # Remove HTML encoding
        text = html.unescape(text)
        
        # Remove markdown code blocks
        if '```json' in text:
            start = text.find('```json') + 7
            end = text.find('```', start)
            if end != -1:
                text = text[start:end]
            else:
                text = text[start:]
        elif '```' in text:
            start = text.find('```') + 3
            end = text.find('```', start)
            if end != -1:
                text = text[start:end]
            else:
                text = text[start:]
        
        # Find JSON object boundaries
        if '{' in text and '}' in text:
            start = text.find('{')
            # Find matching closing brace
            brace_count = 0
            end = -1
            for i in range(start, len(text)):
                if text[i] == '{':
                    brace_count += 1
                elif text[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end = i + 1
                        break
            
            if end != -1:
                text = text[start:end]
        
        return text.strip()

copilot_service = CopilotService()
