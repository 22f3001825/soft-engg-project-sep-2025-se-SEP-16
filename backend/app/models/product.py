from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, UUID, DECIMAL, Float
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

    id = Column(UUID(as_uuid=True), primary_key=True, default=func.gen_random_uuid())
    vendor_id = Column(Integer, ForeignKey("vendors.user_id"))
    name = Column(String(200))
    category = Column(String(120))
    price = Column(DECIMAL(10,2))
    description = Column(Text)
    total_complaints = Column(Integer, default=0)
    return_rate = Column(Float)

    vendor = relationship("Vendor")
    complaints = relationship("ProductComplaint", back_populates="product")

class ProductComplaint(Base):
    __tablename__ = "product_complaints"

    id = Column(Integer, primary_key=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    customer_id = Column(Integer, ForeignKey("customers.user_id"))
    issue = Column(Text)
    severity = Column(String(50))
    status = Column(Enum(ComplaintStatus))
    reported_date = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="complaints")
    customer = relationship("Customer")
