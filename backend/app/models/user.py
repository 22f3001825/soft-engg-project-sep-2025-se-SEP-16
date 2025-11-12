from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    AGENT = "AGENT"
    SUPERVISOR = "SUPERVISOR"
    VENDOR = "VENDOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    avatar = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    customer_profile = relationship("Customer", back_populates="user", uselist=False)
    agent_profile = relationship("Agent", back_populates="user", uselist=False)
    supervisor_profile = relationship("Supervisor", back_populates="user", uselist=False)
    vendor_profile = relationship("Vendor", back_populates="user", uselist=False)

# Role-specific models are defined in separate files
# This avoids duplicate table definitions
