"""
Ticket System Models

This module contains models for the support ticket system, which is the core
of the customer support platform. Tickets track customer issues from creation
through resolution, with full conversation history and AI assistance.

Required for: Features 1, 4, 5, 6, 8 (Ticket Management, AI Copilot, Dashboards)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class TicketStatus(str, enum.Enum):
    """
    Ticket lifecycle status enumeration.
    Tracks the current state of a support ticket through its resolution process.
    """
    OPEN = "OPEN"                              # Newly created, awaiting agent assignment
    IN_PROGRESS = "IN_PROGRESS"                # Agent is actively working on it
    WAITING_FOR_CUSTOMER = "WAITING_FOR_CUSTOMER"  # Waiting for customer response
    RESOLVED = "RESOLVED"                      # Issue fixed, awaiting customer confirmation
    CLOSED = "CLOSED"                          # Completed and closed

class TicketPriority(str, enum.Enum):
    """
    Ticket priority levels for SLA management and agent assignment.
    Higher priority tickets are handled first and have shorter SLA deadlines.
    """
    LOW = "LOW"          # Non-urgent issues, 48-hour SLA
    MEDIUM = "MEDIUM"    # Standard issues, 24-hour SLA
    HIGH = "HIGH"        # Urgent issues, 4-hour SLA
    CRITICAL = "CRITICAL"  # System-down or revenue-impacting, 1-hour SLA

class Ticket(Base):
    """
    Core ticket model representing a customer support request.
    Required for: Features 1, 4, 5, 6, 8 (All ticket-related features)
    
    Tickets are the central entity in the support system. They track customer issues,
    agent assignments, AI assistance, and resolution progress. Each ticket has a full
    conversation history stored in the Message model.
    """
    __tablename__ = "tickets"

    # Primary identification - Using UUID for distributed system compatibility
    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    
    # Ownership - Links ticket to customer and assigned agent
    customer_id = Column(Integer, ForeignKey("customers.user_id"), index=True)  # Who created the ticket
    agent_id = Column(Integer, ForeignKey("agents.user_id"), nullable=True, index=True)  # Who is handling it
    # agent_id is nullable because tickets start unassigned
    
    # Ticket content - Required for understanding the issue
    subject = Column(String(255))  # Brief summary of the issue
    description = Column(Text, nullable=True)  # Detailed explanation from customer
    
    # Classification - Required for routing and analytics (Feature 1)
    category = Column(String(100), nullable=True)  # Billing, Technical, Product, Shipping, Refund
    subcategory = Column(String(100), nullable=True)  # More specific classification
    # Used for skill-based routing to appropriate agents
    
    # Communication channel - Required for omnichannel support
    channel = Column(String(50), default="WEB")  # EMAIL, CHAT, PHONE, WEB
    # Tracks how customer contacted support
    
    # Status tracking - Required for workflow management (Feature 1)
    status = Column(Enum(TicketStatus), nullable=False, index=True)  # Current state in lifecycle
    priority = Column(Enum(TicketPriority), nullable=False, index=True)  # Urgency level
    
    # Context linking - Required for order-related issues (Feature 2)
    related_order_id = Column(String, nullable=True)  # Links to Order if ticket is about an order
    
    # AI assistance fields - Required for AI Copilot (Feature 4)
    ai_suggested_solution = Column(Text, nullable=True)  # AI-generated solution recommendation
    ai_confidence_score = Column(Float, nullable=True)  # How confident AI is (0-1)
    sentiment = Column(String(20), nullable=True)  # POSITIVE, NEUTRAL, NEGATIVE
    # Sentiment helps prioritize angry customers
    
    # SLA tracking - Required for performance monitoring (Feature 5, 6)
    sla_deadline = Column(DateTime, nullable=True)  # When ticket must be resolved by
    first_response_at = Column(DateTime, nullable=True)  # When agent first replied
    resolved_at = Column(DateTime, nullable=True)  # When issue was fixed
    closed_at = Column(DateTime, nullable=True)  # When ticket was closed
    
    # Quality metrics - Required for analytics (Feature 6)
    reopened_count = Column(Integer, default=0)  # How many times customer reopened
    # High reopen count indicates poor initial resolution
    
    # Audit trail - Required for compliance and debugging
    created_at = Column(DateTime, server_default=func.now())  # When ticket was created
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())  # Last update

    # Relationships
    customer = relationship("Customer")  # Link to customer who created ticket
    agent = relationship("Agent")  # Link to assigned agent
    messages = relationship("Message", back_populates="ticket")  # Conversation history

class Message(Base):
    """
    Message model for ticket conversation history.
    Required for: Features 1, 4, 5 (Ticket Management, AI Copilot, Agent Dashboard)
    
    Each message represents one communication in a ticket thread. Messages can be from
    customers, agents, AI, or system notifications. Full conversation history is preserved
    for context and quality assurance.
    """
    __tablename__ = "messages"

    # Primary identification
    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    
    # Message ownership - Links to ticket and sender
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)  # Which ticket this belongs to
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who sent the message
    sender_name = Column(String(120))  # Cached name for display (avoids joins)
    
    # Message content
    content = Column(Text)  # The actual message text
    
    # Message classification - Required for proper display and handling
    message_type = Column(String(20), default="TEXT")  # TEXT, IMAGE, FILE, SYSTEM
    # Different types render differently in UI
    
    # AI tracking - Required for AI Copilot analytics (Feature 4)
    ai_generated = Column(Boolean, default=False)  # True if message was AI-suggested
    # Tracks how often agents use AI suggestions
    
    # Visibility control - Required for internal agent communication
    is_internal = Column(Boolean, default=False)  # True if only visible to agents
    # Allows agents to discuss ticket without customer seeing
    
    # Timestamp - Required for conversation ordering
    created_at = Column(DateTime, server_default=func.now())  # When message was sent

    # Relationships
    ticket = relationship("Ticket", back_populates="messages")  # Link to parent ticket
    sender = relationship("User")  # Link to user who sent message

class Attachment(Base):
    """
    Attachment model for files uploaded in ticket conversations.
    Required for: Feature 1 (Ticket Management)
    
    Customers and agents can attach files (screenshots, documents, logs) to messages.
    Attachments are stored on disk/cloud and linked to specific messages.
    Common use cases: error screenshots, product photos, receipts, return labels.
    """
    __tablename__ = "attachments"

    # Primary identification
    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    
    # Ownership - Links to specific message
    message_id = Column(String, ForeignKey("messages.id"), nullable=False)  # Which message has this file
    
    # File metadata - Required for storage and display
    file_name = Column(String(255))  # Original filename from upload
    file_path = Column(String(500), nullable=False)  # Server storage path (e.g., /uploads/tickets/...)
    file_url = Column(String(500), nullable=True)  # Public URL for download (if using CDN)
    file_size = Column(Integer)  # Size in bytes for storage management
    file_type = Column(String(50))  # MIME type (image/png, application/pdf, etc.)
    
    # Timestamp - Required for audit trail
    uploaded_at = Column(DateTime, server_default=func.now())  # When file was uploaded

    # Relationship
    message = relationship("Message")  # Link to parent message
