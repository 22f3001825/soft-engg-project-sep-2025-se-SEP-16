from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, UUID, DECIMAL, Float, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class AlertType(str, enum.Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"

class NotificationType(str, enum.Enum):
    ORDER = "ORDER"
    TICKET = "TICKET"
    REFUND = "REFUND"
    SYSTEM = "SYSTEM"
    ALERT = "ALERT"

class AgentStats(Base):
    __tablename__ = "agent_stats"

    agent_id = Column(Integer, ForeignKey("agents.user_id"), primary_key=True)
    total_tickets = Column(Integer)
    avg_response_time = Column(Float)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    agent = relationship("Agent")

class SupervisorMetrics(Base):
    __tablename__ = "supervisor_metrics"

    supervisor_id = Column(Integer, ForeignKey("supervisors.user_id"), primary_key=True)
    team_performance = Column(JSON)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    supervisor = relationship("Supervisor")

class ProductMetrics(Base):
    __tablename__ = "product_metrics"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), primary_key=True)
    sales_count = Column(Integer)
    complaint_rate = Column(Float)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200))
    message = Column(Text)
    type = Column(Enum(NotificationType))
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime, server_default=func.now())

    user = relationship("User")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    type = Column(Enum(AlertType))
    message = Column(Text)
    timestamp = Column(DateTime, server_default=func.now())
    severity = Column(Integer)
    resolved = Column(Boolean, default=False)
    supervisor_id = Column(Integer, ForeignKey("supervisors.user_id"))

    supervisor = relationship("Supervisor")
