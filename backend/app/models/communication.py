from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class CommunicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    BOUNCED = "BOUNCED"

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=True)
    refund_request_id = Column(String, ForeignKey("refund_requests.id"), nullable=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    
    # Email Details
    to_email = Column(String(120), nullable=False)
    from_email = Column(String(120), nullable=False)
    subject = Column(String(300), nullable=False)
    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    
    # Template
    template_id = Column(Integer, ForeignKey("communication_templates.id"), nullable=True)
    template_variables = Column(JSON, nullable=True)
    
    # Status
    status = Column(SQLEnum(CommunicationStatus), default=CommunicationStatus.PENDING)
    error_message = Column(Text, nullable=True)
    
    # Tracking
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    
    # Provider Details
    provider = Column(String(50), nullable=True)  # SendGrid, AWS SES, etc.
    provider_message_id = Column(String(200), nullable=True)
    
    # Metadata
    priority = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User")
    ticket = relationship("Ticket")
    template = relationship("CommunicationTemplate")

class WhatsAppLog(Base):
    __tablename__ = "whatsapp_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=True)
    refund_request_id = Column(String, ForeignKey("refund_requests.id"), nullable=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    
    # WhatsApp Details
    to_phone = Column(String(20), nullable=False)
    from_phone = Column(String(20), nullable=False)
    message_text = Column(Text, nullable=False)
    message_type = Column(String(50), default="TEXT")  # TEXT, IMAGE, DOCUMENT, TEMPLATE
    
    # Template
    template_id = Column(Integer, ForeignKey("communication_templates.id"), nullable=True)
    template_name = Column(String(200), nullable=True)  # WhatsApp template name
    template_variables = Column(JSON, nullable=True)
    
    # Media
    media_url = Column(String(500), nullable=True)
    media_type = Column(String(50), nullable=True)
    
    # Status
    status = Column(SQLEnum(CommunicationStatus), default=CommunicationStatus.PENDING)
    error_message = Column(Text, nullable=True)
    
    # Tracking
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    
    # Provider Details
    provider = Column(String(50), nullable=True)  # Twilio, WhatsApp Business API, etc.
    provider_message_id = Column(String(200), nullable=True)
    
    # Metadata
    retry_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User")
    ticket = relationship("Ticket")
    template = relationship("CommunicationTemplate")

class CommunicationTemplate(Base):
    __tablename__ = "communication_templates"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Template Type
    channel = Column(String(50), nullable=False)  # EMAIL, WHATSAPP, SMS
    category = Column(String(100), nullable=False)  # TICKET_UPDATE, REFUND_STATUS, ORDER_SHIPPED, etc.
    
    # Email Template
    email_subject = Column(String(300), nullable=True)
    email_body_text = Column(Text, nullable=True)
    email_body_html = Column(Text, nullable=True)
    
    # WhatsApp Template
    whatsapp_template_name = Column(String(200), nullable=True)
    whatsapp_message = Column(Text, nullable=True)
    
    # Variables
    variables = Column(JSON, nullable=True)  # List of available variables
    sample_data = Column(JSON, nullable=True)  # Sample data for testing
    
    # Usage
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    created_by_user = relationship("User")

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Email Preferences
    email_enabled = Column(Boolean, default=True)
    email_ticket_updates = Column(Boolean, default=True)
    email_order_updates = Column(Boolean, default=True)
    email_refund_updates = Column(Boolean, default=True)
    email_marketing = Column(Boolean, default=False)
    
    # WhatsApp Preferences
    whatsapp_enabled = Column(Boolean, default=False)
    whatsapp_ticket_updates = Column(Boolean, default=False)
    whatsapp_order_updates = Column(Boolean, default=False)
    whatsapp_refund_updates = Column(Boolean, default=False)
    
    # In-App Preferences
    inapp_enabled = Column(Boolean, default=True)
    inapp_ticket_updates = Column(Boolean, default=True)
    inapp_order_updates = Column(Boolean, default=True)
    inapp_refund_updates = Column(Boolean, default=True)
    
    # Frequency
    digest_frequency = Column(String(20), default="IMMEDIATE")  # IMMEDIATE, DAILY, WEEKLY
    quiet_hours_start = Column(String(5), nullable=True)  # "22:00"
    quiet_hours_end = Column(String(5), nullable=True)  # "08:00"
    
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")
