from sqlalchemy import Column, Integer, String, ARRAY, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Vendor(Base):
    __tablename__ = "vendors"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    company_name = Column(String(150), nullable=True)
    business_license = Column(String(150), nullable=True)
    product_categories = Column(ARRAY(String), nullable=True)
    total_products = Column(Integer, default=0)

    # Relationship
    user = relationship("User", back_populates="vendor")
