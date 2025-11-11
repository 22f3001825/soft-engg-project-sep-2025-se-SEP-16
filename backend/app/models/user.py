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

class Customer(Base):
    __tablename__ = "customers"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    preferences = Column(JSON)
    total_orders = Column(Integer, default=0)
    total_tickets = Column(Integer, default=0)
    member_since = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="customer_profile")

class Agent(Base):
    __tablename__ = "agents"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    employee_id = Column(String(50), unique=True)
    department = Column(String(100))
    response_time = Column(Float)
    tickets_resolved = Column(Integer, default=0)

    user = relationship("User", back_populates="agent_profile")

class Supervisor(Base):
    __tablename__ = "supervisors"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    team_size = Column(Integer)
    managed_departments = Column(String)
    escalation_level = Column(Integer)

    user = relationship("User", back_populates="supervisor_profile")

class Vendor(Base):
    __tablename__ = "vendors"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    company_name = Column(String(150))
    business_license = Column(String(150))
    product_categories = Column(String)
    total_products = Column(Integer, default=0)

    user = relationship("User", back_populates="vendor_profile")
