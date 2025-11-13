from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURNED = "RETURNED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    order_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.user_id"))
    status = Column(Enum(OrderStatus), nullable=False)
    subtotal = Column(Float)
    tax = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float)
    payment_method = Column(String(50), nullable=True)
    payment_status = Column(String(50), default="PENDING")  # PENDING, PAID, FAILED, REFUNDED
    shipping_address = Column(JSON, nullable=True)
    billing_address = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String)
    product_name = Column(String(150))
    quantity = Column(Integer)
    price = Column(Float)
    subtotal = Column(Float)

    order = relationship("Order", back_populates="items")

class TrackingInfo(Base):
    __tablename__ = "tracking_info"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    tracking_number = Column(String(100), unique=True, nullable=False)
    current_location = Column(String(200))
    status = Column(String(100))
    estimated_delivery = Column(DateTime)
    courier_name = Column(String(100))
    courier_contact = Column(String(100))
    tracking_history = Column(JSON, nullable=True)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    order = relationship("Order")
