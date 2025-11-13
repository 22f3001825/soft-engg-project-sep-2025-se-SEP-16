"""
User and Role Profile Models

This module contains the core user authentication and role-based profile models.
All users in the system (customers, agents, supervisors, vendors) start with a User record,
then have an associated role-specific profile for additional data.

Design Pattern: Single Table Inheritance with separate profile tables
- User table: Common authentication data
- Role tables: Role-specific data (Customer, Agent, Supervisor, Vendor)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class UserRole(str, enum.Enum):
    """
    User role enumeration for role-based access control (RBAC).
    Each role has different permissions and access to different features.
    """
    CUSTOMER = "CUSTOMER"      # End users who purchase products and create support tickets
    AGENT = "AGENT"            # Support staff who handle tickets and assist customers
    SUPERVISOR = "SUPERVISOR"  # Managers who oversee agents and monitor performance
    VENDOR = "VENDOR"          # Product sellers who manage inventory and handle returns

class User(Base):
    """
    Core user model for authentication and common user data.
    Required for: All 10 features (base authentication)
    
    This is the central authentication table. Every person using the system
    (customer, agent, supervisor, vendor) has a User record. The role field
    determines which profile table contains their additional data.
    """
    __tablename__ = "users"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)  # Unique user identifier
    
    # Authentication fields - Required for login/signup (Features 1-10)
    email = Column(String(120), unique=True, nullable=False, index=True)  # Login username, must be unique
    password = Column(String(255), nullable=False)  # Hashed password using bcrypt
    
    # User information
    full_name = Column(String(120), nullable=False)  # Display name across the platform
    role = Column(Enum(UserRole), nullable=False, index=True)  # Determines access permissions and features
    avatar = Column(Text)  # Profile picture URL, generated from DiceBear API
    
    # Account status - Required for security and user management
    is_active = Column(Boolean, default=True)  # Allows account suspension without deletion
    last_login = Column(DateTime, nullable=True)  # Security tracking and activity monitoring
    
    # Audit trail - Required for compliance and debugging
    created_at = Column(DateTime, server_default=func.now())  # Account creation timestamp
    updated_at = Column(DateTime, onupdate=func.now())  # Last profile update timestamp

    # Relationships to role-specific profiles
    # Each user has exactly one profile based on their role
    # uselist=False ensures one-to-one relationship
    customer_profile = relationship("Customer", back_populates="user", uselist=False)
    agent_profile = relationship("Agent", back_populates="user", uselist=False)
    supervisor_profile = relationship("Supervisor", back_populates="user", uselist=False)
    vendor_profile = relationship("Vendor", back_populates="user", uselist=False)

class Customer(Base):
    """
    Customer profile model for end users who purchase products and request support.
    Required for: Features 2, 8 (Refund Assistant, Customer Portal)
    
    Stores customer-specific data like order history, preferences, and loyalty points.
    Linked to User via user_id foreign key (one-to-one relationship).
    """
    __tablename__ = "customers"

    # Primary key is also foreign key to users table
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    # Contact information - Required for order delivery and support (Feature 8)
    phone = Column(String(20), nullable=True)  # Contact number for delivery updates
    
    # Customer preferences - Required for personalization (Feature 2, 8)
    preferences = Column(JSON)  # Stores notification settings, language, theme, etc.
    
    # Activity metrics - Required for customer analytics and loyalty programs
    total_orders = Column(Integer, default=0)  # Count of all orders placed
    total_tickets = Column(Integer, default=0)  # Count of support tickets created
    loyalty_points = Column(Integer, default=0)  # Rewards points for future discounts
    
    # Membership tracking
    member_since = Column(DateTime, server_default=func.now())  # Account age for VIP status

    # Relationship back to User table
    user = relationship("User", back_populates="customer_profile")

class Agent(Base):
    """
    Agent profile model for support staff who handle customer tickets.
    Required for: Features 1, 4, 5 (Ticket Management, AI Copilot, Agent Dashboard)
    
    Stores agent-specific data like skills, workload capacity, and performance metrics.
    Agents are assigned tickets based on their skills, availability, and current workload.
    """
    __tablename__ = "agents"

    # Primary key is also foreign key to users table
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    # Employee identification - Optional, can be auto-generated
    employee_id = Column(String(50), unique=True, nullable=True)  # Company employee ID
    
    # Organization structure
    department = Column(String(100))  # e.g., "Technical Support", "Billing", "Returns"
    
    # Real-time status - Required for workload management (Feature 5)
    status = Column(String(20), default="OFFLINE")  # AVAILABLE, BUSY, OFFLINE, BREAK
    # Used to determine if agent can receive new ticket assignments
    
    # Skill-based routing - Required for intelligent ticket assignment (Feature 1)
    skills = Column(JSON, nullable=True)  # e.g., ["billing", "technical", "shipping"]
    # Tickets are routed to agents with matching skills
    
    # Multi-language support - Required for international customers
    languages = Column(JSON, nullable=True)  # e.g., ["en", "es", "fr"]
    # Customers matched with agents who speak their language
    
    # Workload management - Required for preventing agent burnout (Feature 5)
    max_concurrent_tickets = Column(Integer, default=5)  # Maximum tickets agent can handle
    # System prevents over-assignment based on this limit
    
    # Performance metrics - Required for analytics (Feature 6)
    response_time = Column(Float)  # Average time to first response in minutes
    tickets_resolved = Column(Integer, default=0)  # Total tickets successfully resolved
    satisfaction_rating = Column(Float, default=0.0)  # Average customer rating (0-5)

    # Relationship back to User table
    user = relationship("User", back_populates="agent_profile")

class Supervisor(Base):
    """
    Supervisor profile model for managers who oversee support teams.
    Required for: Features 1, 4, 6 (Ticket Management, AI Copilot, Supervisor Analytics)
    
    Supervisors monitor team performance, handle escalations, and access system-wide analytics.
    They can reassign tickets, override decisions, and view all team metrics.
    """
    __tablename__ = "supervisors"

    # Primary key is also foreign key to users table
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    # Team management - Required for analytics (Feature 6)
    team_size = Column(Integer)  # Number of agents under supervision
    managed_departments = Column(String)  # Comma-separated list of departments
    
    # Escalation handling - Required for ticket management (Feature 1)
    escalation_level = Column(Integer)  # Higher level = can handle more complex issues
    # Determines which escalated tickets this supervisor can handle
    
    # Relationship back to User table
    user = relationship("User", back_populates="supervisor_profile")

class Vendor(Base):
    """
    Vendor profile model for product sellers who manage inventory and handle returns.
    Required for: Feature 7 (Vendor Product Quality Analytics)
    
    Vendors list products, fulfill orders, and respond to product complaints.
    They have access to analytics about their product performance and return rates.
    """
    __tablename__ = "vendors"

    # Primary key is also foreign key to users table
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    # Business information - Required for legal compliance and communication
    company_name = Column(String(150))  # Legal business name
    business_type = Column(String(100), nullable=True)  # Manufacturer, Reseller, Dropshipper
    business_license = Column(String(150))  # Business registration number
    tax_id = Column(String(100), nullable=True)  # Tax identification for payments
    
    # Contact information - Required for order fulfillment and support
    contact_email = Column(String(120), nullable=True)  # Business email for notifications
    contact_phone = Column(String(20), nullable=True)  # Phone for urgent issues
    address = Column(Text, nullable=True)  # Business address for returns
    
    # Product management - Required for catalog organization (Feature 7)
    product_categories = Column(String)  # Categories vendor sells in
    total_products = Column(Integer, default=0)  # Count of active products
    
    # Vendor reputation - Required for quality control (Feature 7)
    rating = Column(Float, default=0.0)  # Average rating from customers (0-5)
    verified = Column(Boolean, default=False)  # Platform verification status
    # Verified vendors get priority in search results

    # Relationship back to User table
    user = relationship("User", back_populates="vendor_profile")
