from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Ticket schemas
class TicketCreate(BaseModel):
    subject: str
    description: str
    order_id: Optional[str] = None
    priority: str = "MEDIUM"

class MessageCreate(BaseModel):
    content: str

# Order schemas
class ReturnRequest(BaseModel):
    order_id: str
    items: List[str]
    reason: str
    description: Optional[str] = None

# Profile schemas
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

# Settings schemas
class SettingsUpdate(BaseModel):
    notifications: Optional[Dict[str, bool]] = None
    general: Optional[Dict[str, str]] = None

# Response schemas
class DashboardStats(BaseModel):
    open_tickets: int
    active_orders: int
    pending_refunds: int
    resolved_tickets: int

class OrderSummary(BaseModel):
    id: str
    status: str
    total: float
    created_at: datetime
    item_count: int

class TicketSummary(BaseModel):
    id: str
    subject: str
    status: str
    priority: str
    created_at: datetime

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_orders: List[OrderSummary]
    recent_tickets: List[TicketSummary]