from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.models.order import OrderStatus

class OrderItemBase(BaseModel):
    product_id: UUID
    product_name: str
    quantity: int
    price: Decimal

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: UUID
    order_id: UUID

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    order_number: str
    total_amount: Decimal

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None

class OrderInDBBase(OrderBase):
    id: UUID
    status: OrderStatus
    customer_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class Order(OrderInDBBase):
    customer_name: Optional[str] = None
    items: List[OrderItem] = []

class OrderTracking(BaseModel):
    order_id: UUID
    status: OrderStatus
    estimated_delivery: Optional[datetime] = None
    tracking_number: Optional[str] = None

class TrackingInfoBase(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    current_location: Optional[str] = None

class TrackingInfoCreate(TrackingInfoBase):
    pass

class TrackingInfo(TrackingInfoBase):
    id: UUID
    order_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True
