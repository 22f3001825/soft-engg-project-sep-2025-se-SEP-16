from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    category: str
    stock_quantity: int
    vendor_id: UUID

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None

class Product(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ProductComplaintBase(BaseModel):
    product_id: UUID
    customer_id: UUID
    complaint_type: str
    description: str
    severity: str

class ProductComplaintCreate(ProductComplaintBase):
    pass

class ProductComplaintUpdate(BaseModel):
    status: Optional[str] = None
    resolution: Optional[str] = None

class ProductComplaint(ProductComplaintBase):
    id: UUID
    status: str
    resolution: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
