from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Request schemas - for incoming API data
class TicketCreate(BaseModel):
    subject: str
    description: str
    order_id: Optional[str] = None
    priority: str = "MEDIUM"

class MessageCreate(BaseModel):
    content: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class SettingsUpdate(BaseModel):
    notifications: Optional[Dict[str, bool]] = None
    general: Optional[Dict[str, str]] = None

class ReturnRequest(BaseModel):
    order_id: str
    items: List[str]
    reason: str
    description: Optional[str] = None