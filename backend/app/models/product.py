from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
import uuid
from app.models.base import Base

class ComplaintStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(Integer, ForeignKey("vendors.user_id"))
    name = Column(String(200))
    category = Column(String(120))
    price = Column(Float)
    description = Column(Text)
    total_complaints = Column(Integer, default=0)
    return_rate = Column(Float)

    vendor = relationship("Vendor")
    complaints = relationship("ProductComplaint", back_populates="product")

class ProductComplaint(Base):
    __tablename__ = "product_complaints"

    id = Column(Integer, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"))
    customer_id = Column(Integer, ForeignKey("customers.user_id"))
    issue = Column(Text)
    severity = Column(String(50))
    status = Column(Enum(ComplaintStatus))
    reported_date = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="complaints")
    customer = relationship("Customer")
