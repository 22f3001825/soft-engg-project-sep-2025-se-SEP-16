from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class TicketAssign(BaseModel):
    agent_id: Optional[int] = None

class TicketStatusUpdate(BaseModel):
    status: str

class TicketPriorityUpdate(BaseModel):
    priority: str

class MessageCreate(BaseModel):
    content: str
    is_internal: Optional[bool] = False

class CustomerNote(BaseModel):
    content: str

class CommunicationSend(BaseModel):
    type: str  # email, whatsapp
    to: str
    subject: Optional[str] = None
    content: str

class TemplateCreate(BaseModel):
    name: str
    tags: Optional[str] = None
    body: str

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    tags: Optional[str] = None
    body: Optional[str] = None

class SettingsUpdate(BaseModel):
    notifications: Optional[bool] = None
    email_signature: Optional[str] = None
    auto_assign: Optional[bool] = None
    working_hours: Optional[Dict[str, str]] = None