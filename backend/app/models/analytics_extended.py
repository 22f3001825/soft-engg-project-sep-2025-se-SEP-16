from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class AgentWorkload(Base):
    __tablename__ = "agent_workload"

    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.user_id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # Ticket Counts
    assigned_tickets = Column(Integer, default=0)
    active_tickets = Column(Integer, default=0)
    resolved_tickets = Column(Integer, default=0)
    escalated_tickets = Column(Integer, default=0)
    
    # Time Metrics
    total_work_time_minutes = Column(Integer, default=0)
    avg_response_time_minutes = Column(Float, nullable=True)
    avg_resolution_time_minutes = Column(Float, nullable=True)
    
    # Performance
    sla_met_count = Column(Integer, default=0)
    sla_missed_count = Column(Integer, default=0)
    customer_satisfaction_avg = Column(Float, nullable=True)
    
    # Capacity
    current_capacity_percentage = Column(Float, nullable=True)  # Based on max_concurrent_tickets
    available_for_assignment = Column(Boolean, default=True)
    
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    agent = relationship("Agent")

class SLATracking(Base):
    __tablename__ = "sla_tracking"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, unique=True)
    
    # SLA Targets (in minutes)
    first_response_target = Column(Integer, nullable=False)  # e.g., 60 minutes
    resolution_target = Column(Integer, nullable=False)  # e.g., 1440 minutes (24 hours)
    
    # Actual Times
    first_response_time = Column(Integer, nullable=True)  # Actual time taken
    resolution_time = Column(Integer, nullable=True)
    
    # Status
    first_response_met = Column(Boolean, nullable=True)
    resolution_met = Column(Boolean, nullable=True)
    overall_sla_met = Column(Boolean, nullable=True)
    
    # Breach Tracking
    first_response_breach_minutes = Column(Integer, nullable=True)  # How much over target
    resolution_breach_minutes = Column(Integer, nullable=True)
    breach_reason = Column(Text, nullable=True)
    
    # Escalation
    escalated = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    escalated_at = Column(DateTime, nullable=True)
    
    # Pause/Resume (for customer waiting time)
    paused_time_minutes = Column(Integer, default=0)  # Time waiting for customer
    pause_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    ticket = relationship("Ticket")

class TeamPerformance(Base):
    __tablename__ = "team_performance"

    id = Column(Integer, primary_key=True)
    supervisor_id = Column(Integer, ForeignKey("supervisors.user_id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # Team Metrics
    team_size = Column(Integer, nullable=False)
    active_agents = Column(Integer, default=0)
    
    # Ticket Metrics
    total_tickets_assigned = Column(Integer, default=0)
    total_tickets_resolved = Column(Integer, default=0)
    total_tickets_escalated = Column(Integer, default=0)
    avg_resolution_time_minutes = Column(Float, nullable=True)
    
    # SLA Performance
    sla_met_count = Column(Integer, default=0)
    sla_missed_count = Column(Integer, default=0)
    sla_compliance_rate = Column(Float, nullable=True)  # Percentage
    
    # Quality Metrics
    avg_customer_satisfaction = Column(Float, nullable=True)
    avg_agent_rating = Column(Float, nullable=True)
    total_customer_feedback = Column(Integer, default=0)
    
    # Efficiency
    avg_tickets_per_agent = Column(Float, nullable=True)
    avg_response_time_minutes = Column(Float, nullable=True)
    
    # Department Breakdown
    department_metrics = Column(JSON, nullable=True)  # Per-department stats
    
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    supervisor = relationship("Supervisor")

class AgentRating(Base):
    __tablename__ = "agent_ratings"

    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.user_id"), nullable=False)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    
    # Rating
    rating = Column(Integer, nullable=False)  # 1-5 stars
    feedback = Column(Text, nullable=True)
    
    # Rating Categories
    professionalism = Column(Integer, nullable=True)  # 1-5
    responsiveness = Column(Integer, nullable=True)  # 1-5
    knowledge = Column(Integer, nullable=True)  # 1-5
    problem_solving = Column(Integer, nullable=True)  # 1-5
    
    # Context
    resolution_time_minutes = Column(Integer, nullable=True)
    interaction_count = Column(Integer, nullable=True)  # Number of messages exchanged
    
    # Sentiment Analysis
    sentiment = Column(String(20), nullable=True)  # POSITIVE, NEUTRAL, NEGATIVE
    sentiment_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    agent = relationship("Agent")
    ticket = relationship("Ticket")
    customer = relationship("Customer")

class ProductReturnAnalytics(Base):
    __tablename__ = "product_return_analytics"

    id = Column(Integer, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.user_id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # Return Metrics
    total_returns = Column(Integer, default=0)
    total_sales = Column(Integer, default=0)
    return_rate = Column(Float, nullable=True)  # Percentage
    
    # Return Reasons
    reason_breakdown = Column(JSON, nullable=True)  # {reason: count}
    top_return_reason = Column(String(100), nullable=True)
    
    # Financial Impact
    total_refund_amount = Column(Float, default=0.0)
    avg_refund_amount = Column(Float, nullable=True)
    
    # Quality Issues
    defect_count = Column(Integer, default=0)
    damage_count = Column(Integer, default=0)
    wrong_item_count = Column(Integer, default=0)
    not_as_described_count = Column(Integer, default=0)
    
    # Fraud Detection
    fraud_suspected_count = Column(Integer, default=0)
    fraud_confirmed_count = Column(Integer, default=0)
    
    # Trends
    trend_direction = Column(String(20), nullable=True)  # INCREASING, DECREASING, STABLE
    trend_percentage = Column(Float, nullable=True)
    
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    product = relationship("Product")
    vendor = relationship("Vendor")

class TicketActivity(Base):
    __tablename__ = "ticket_activities"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Activity Details
    activity_type = Column(String(50), nullable=False)  # CREATED, ASSIGNED, STATUS_CHANGED, PRIORITY_CHANGED, etc.
    description = Column(Text, nullable=False)
    
    # Changes
    field_changed = Column(String(100), nullable=True)
    old_value = Column(String(500), nullable=True)
    new_value = Column(String(500), nullable=True)
    
    # Metadata
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    ticket = relationship("Ticket")
    user = relationship("User")

class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    
    # Address Details
    label = Column(String(50), nullable=True)  # "Home", "Office", "Parents' House"
    full_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    address_line1 = Column(String(200), nullable=False)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    
    # Preferences
    is_default = Column(Boolean, default=False)
    is_billing_address = Column(Boolean, default=False)
    
    # Validation
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    customer = relationship("Customer")
