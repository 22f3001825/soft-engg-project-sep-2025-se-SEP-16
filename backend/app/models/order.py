from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, DECIMAL, UUID
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

    id = Column(UUID(as_uuid=True), primary_key=True, default=func.gen_random_uuid())
    customer_id = Column(Integer, ForeignKey("customers.user_id"))
    status = Column(Enum(OrderStatus), nullable=False)
    total = Column(DECIMAL(10,2))
    created_at = Column(DateTime, server_default=func.now())
    tracking_number = Column(String(100))
    estimated_delivery = Column(DateTime)

    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=func.gen_random_uuid())
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True))
    product_name = Column(String(150))
    quantity = Column(Integer)
    price = Column(DECIMAL(10,2))
    subtotal = Column(DECIMAL(10,2))

    order = relationship("Order", back_populates="items")

class TrackingInfo(Base):
    __tablename__ = "tracking_info"

    tracking_number = Column(String(100), primary_key=True)
    current_location = Column(String(200))
    status = Column(String(100))
    estimated_delivery = Column(DateTime)
    courier_name = Column(String(100))
    courier_contact = Column(String(100))
