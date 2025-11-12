from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class ComplaintStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    vendor_id = Column(Integer, ForeignKey("vendors.user_id"))
    sku = Column(String(100), unique=True, nullable=True)
    name = Column(String(200))
    category = Column(String(120))
    price = Column(Float)
    description = Column(Text)
    stock_quantity = Column(Integer, default=0)
    images = Column(JSON, nullable=True)  # Array of image URLs
    is_active = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    total_complaints = Column(Integer, default=0)
    return_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    vendor = relationship("Vendor")
    complaints = relationship("ProductComplaint", back_populates="product")

class ProductComplaint(Base):
    __tablename__ = "product_complaints"

    id = Column(Integer, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"))
    customer_id = Column(Integer, ForeignKey("customers.user_id"))
    description = Column(Text)
    severity = Column(String(50))
    status = Column(Enum(ComplaintStatus))
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    product = relationship("Product", back_populates="complaints")
    customer = relationship("Customer")
