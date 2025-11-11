from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.ticket import TicketStatus, TicketPriority

class TicketBase(BaseModel):
    subject: str
    description: Optional[str] = None
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    agent_id: Optional[int] = None

class TicketInDBBase(TicketBase):
    id: UUID
    status: TicketStatus
    priority: TicketPriority
    customer_id: int
    agent_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class Ticket(TicketInDBBase):
    customer_name: Optional[str] = None
    agent_name: Optional[str] = None

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: UUID
    ticket_id: UUID
    sender_id: int
    sender_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TicketWithMessages(Ticket):
    messages: List[Message] = []

class AttachmentBase(BaseModel):
    filename: str
    file_url: str
    file_type: str

class AttachmentCreate(AttachmentBase):
    pass

class Attachment(AttachmentBase):
    id: UUID
    ticket_id: UUID
    uploaded_by: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
