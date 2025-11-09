from sqlalchemy import Column, Integer, DateTime, func, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Customer(Base):
    __tablename__ = "customers"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    preferences = Column(JSON, nullable=True)
    total_orders = Column(Integer, default=0)
    total_tickets = Column(Integer, default=0)
    member_since = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="customer")
