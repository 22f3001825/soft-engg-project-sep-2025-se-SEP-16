from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class TicketSummary(Base):
    __tablename__ = "ticket_summaries"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, unique=True)
    
    # AI-Generated Summary
    summary = Column(Text, nullable=False)
    key_points = Column(JSON, nullable=True)  # Array of key points
    customer_sentiment = Column(String(20), nullable=True)
    urgency_level = Column(String(20), nullable=True)
    
    # Issue Classification
    detected_category = Column(String(100), nullable=True)
    detected_subcategory = Column(String(100), nullable=True)
    related_products = Column(JSON, nullable=True)  # Array of product IDs
    related_orders = Column(JSON, nullable=True)  # Array of order IDs
    
    # AI Metadata
    model_used = Column(String(100), nullable=True)
    confidence_score = Column(Float, nullable=True)
    generation_time_ms = Column(Integer, nullable=True)
    
    # Usage
    viewed_by_agents = Column(JSON, nullable=True)  # Array of agent IDs who viewed
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    ticket = relationship("Ticket")

class SuggestedResponse(Base):
    __tablename__ = "suggested_responses"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.user_id"), nullable=True)
    
    # Suggested Response
    response_text = Column(Text, nullable=False)
    response_type = Column(String(50), nullable=True)  # SOLUTION, CLARIFICATION, ESCALATION, CLOSING
    tone = Column(String(50), default="PROFESSIONAL")  # PROFESSIONAL, EMPATHETIC, FORMAL, FRIENDLY
    
    # AI Analysis
    confidence_score = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=True)  # Why this response was suggested
    based_on_tickets = Column(JSON, nullable=True)  # Similar resolved tickets
    based_on_kb_articles = Column(JSON, nullable=True)  # Knowledge base articles used
    
    # Actions Suggested
    suggested_actions = Column(JSON, nullable=True)  # Array of actions (refund, escalate, etc.)
    estimated_resolution_time = Column(Integer, nullable=True)  # Minutes
    
    # Usage
    used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)
    modified_before_use = Column(Boolean, nullable=True)
    feedback_rating = Column(Integer, nullable=True)  # 1-5
    feedback_comment = Column(Text, nullable=True)
    
    # Metadata
    model_used = Column(String(100), nullable=True)
    generation_time_ms = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    ticket = relationship("Ticket")
    agent = relationship("Agent")

class ResponseTemplate(Base):
    __tablename__ = "response_templates"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Refund, Return, Shipping, Technical, etc.
    subcategory = Column(String(100), nullable=True)
    
    # Template Variables
    variables = Column(JSON, nullable=True)  # {customer_name}, {order_id}, etc.
    
    # Ownership
    agent_id = Column(Integer, ForeignKey("agents.user_id"), nullable=True)  # NULL for shared templates
    is_shared = Column(Boolean, default=False)  # Available to all agents
    is_official = Column(Boolean, default=False)  # Created by supervisors/admins
    
    # Usage Metrics
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    success_rate = Column(Float, nullable=True)  # Based on ticket resolution
    avg_customer_rating = Column(Float, nullable=True)
    
    # AI Enhancement
    ai_optimized = Column(Boolean, default=False)
    ai_optimization_date = Column(DateTime, nullable=True)
    original_template_id = Column(Integer, ForeignKey("response_templates.id"), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    agent = relationship("Agent", foreign_keys=[agent_id])

class RefundExplanation(Base):
    __tablename__ = "refund_explanations"

    id = Column(Integer, primary_key=True)
    refund_request_id = Column(String, ForeignKey("refund_requests.id"), nullable=False)
    
    # AI-Generated Explanation
    explanation = Column(Text, nullable=False)
    decision = Column(String(50), nullable=False)  # APPROVED, REJECTED, NEEDS_REVIEW
    reasoning_points = Column(JSON, nullable=True)  # Array of reasoning points
    
    # Policy References
    policy_sections = Column(JSON, nullable=True)  # Relevant policy sections
    similar_cases = Column(JSON, nullable=True)  # Similar past cases
    
    # Customer-Facing
    customer_explanation = Column(Text, nullable=True)  # Simplified version for customer
    next_steps = Column(JSON, nullable=True)  # What customer should do next
    
    # Agent-Facing
    agent_notes = Column(Text, nullable=True)  # Additional context for agents
    risk_factors = Column(JSON, nullable=True)  # Fraud or policy risks
    
    # Metadata
    model_used = Column(String(100), nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    refund_request = relationship("RefundRequest")
