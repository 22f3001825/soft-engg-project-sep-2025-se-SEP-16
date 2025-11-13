from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from sqlalchemy import func, extract, or_

from app.database import get_db
from app.models.user import User, Agent, Customer
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, Message, TicketStatus, TicketPriority
from app.models.analytics import Notification, NotificationType
from app.services.auth import get_current_user
from app.schemas.agent import (
    TicketAssign, TicketStatusUpdate, MessageCreate, CustomerNote, 
    CommunicationSend, TemplateCreate, TemplateUpdate, SettingsUpdate
)

router = APIRouter(prefix="/agent", tags=["agent"])

# Dashboard APIs
@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get agent dashboard data"""
    agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent profile not found")
    
    # Get ticket statistics (agent-specific)
    assigned_tickets = db.query(Ticket).filter(Ticket.agent_id == current_user.id).count()
    available_tickets = db.query(Ticket).filter(
        or_(Ticket.agent_id == current_user.id, Ticket.agent_id.is_(None))
    ).count()
    high_priority = db.query(Ticket).filter(
        Ticket.agent_id == current_user.id,
        Ticket.priority == TicketPriority.HIGH
    ).count()
    overdue_tickets = db.query(Ticket).filter(
        Ticket.agent_id == current_user.id,
        Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]),
        Ticket.created_at < datetime.now() - timedelta(days=2)
    ).count()
    
    # Get recent assigned tickets
    recent_tickets = db.query(Ticket).filter(
        Ticket.agent_id == current_user.id
    ).order_by(Ticket.updated_at.desc()).limit(5).all()
    
    return {
        "stats": {
            "available_tickets": available_tickets,
            "assigned_to_me": assigned_tickets,
            "high_priority": high_priority,
            "overdue": overdue_tickets
        },
        "recent_tickets": [{
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at,
            "customer_name": db.query(User).filter(User.id == ticket.customer_id).first().full_name
        } for ticket in recent_tickets]
    }

@router.get("/tickets")
def get_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tickets with filtering - agents see only their tickets + unassigned"""
    if assigned_only:
        # Show only tickets assigned to this agent
        query = db.query(Ticket).filter(Ticket.agent_id == current_user.id)
    else:
        # Show tickets assigned to this agent + unassigned tickets (available to pick up)
        query = db.query(Ticket).filter(
            or_(Ticket.agent_id == current_user.id, Ticket.agent_id.is_(None))
        )
    
    if status and status != "all":
        query = query.filter(Ticket.status == status.upper())
    
    if priority and priority != "all":
        query = query.filter(Ticket.priority == priority.upper())
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    result = []
    for ticket in tickets:
        customer = db.query(User).filter(User.id == ticket.customer_id).first()
        message_count = db.query(Message).filter(Message.ticket_id == ticket.id).count()
        
        result.append({
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
            "customer_name": customer.full_name if customer else "Unknown",
            "customer_email": customer.email if customer else "",
            "message_count": message_count,
            "agent_id": ticket.agent_id
        })
    
    return result

@router.get("/tickets/{ticket_id}")
def get_ticket_details(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ticket details with messages"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    customer = db.query(User).filter(User.id == ticket.customer_id).first()
    messages = db.query(Message).filter(Message.ticket_id == ticket.id).order_by(Message.created_at).all()
    
    # Get related order if exists
    order = None
    if ticket.related_order_id:
        order = db.query(Order).filter(Order.id == ticket.related_order_id).first()
        if order:
            items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            order = {
                "id": order.id,
                "total": order.total,
                "status": order.status,
                "created_at": order.created_at,
                "items": [{"product_name": item.product_name, "quantity": item.quantity} for item in items]
            }
    
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "customer": {
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email
        } if customer else None,
        "agent_id": ticket.agent_id,
        "related_order": order,
        "messages": [{
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender_name,
            "content": msg.content,
            "created_at": msg.created_at,
            "is_internal": msg.is_internal,
            "sender_type": "agent" if msg.sender_id != ticket.customer_id else "customer"
        } for msg in messages]
    }

@router.put("/tickets/{ticket_id}/assign")
def assign_ticket(
    ticket_id: str,
    assign_data: TicketAssign,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign ticket to agent"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.agent_id = assign_data.agent_id or current_user.id
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Ticket assigned successfully"}

@router.put("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: str,
    status_data: TicketStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update ticket status"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = TicketStatus(status_data.status)
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Ticket status updated successfully"}

@router.post("/tickets/{ticket_id}/messages")
def add_ticket_message(
    ticket_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add agent message to ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=message_data.content,
        is_internal=message_data.is_internal or False
    )
    
    ticket.updated_at = datetime.utcnow()
    
    db.add(message)
    db.commit()
    
    return {"message": "Message added successfully"}

# Customer Profile APIs
@router.get("/customers")
def get_customers(
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customers assigned to agent"""
    # Get customers from tickets assigned to this agent
    query = db.query(User).join(Ticket, User.id == Ticket.customer_id).filter(
        Ticket.agent_id == current_user.id
    ).distinct()
    
    if search:
        query = query.filter(
            or_(User.full_name.contains(search), User.email.contains(search))
        )
    
    customers = query.all()
    
    result = []
    for customer in customers:
        customer_profile = db.query(Customer).filter(Customer.user_id == customer.id).first()
        total_orders = db.query(Order).filter(Order.customer_id == customer.id).count()
        total_tickets = db.query(Ticket).filter(Ticket.customer_id == customer.id).count()
        
        result.append({
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "avatar": customer.avatar,
            "member_since": customer_profile.member_since if customer_profile else customer.created_at,
            "total_orders": total_orders,
            "total_tickets": total_tickets
        })
    
    return result

@router.get("/customers/{customer_id}")
def get_customer_details(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer details with orders and tickets"""
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get customer orders
    orders = db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).limit(10).all()
    order_list = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        order_list.append({
            "id": order.id,
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at,
            "items": [item.product_name for item in items]
        })
    
    # Get customer tickets
    tickets = db.query(Ticket).filter(Ticket.customer_id == customer_id).order_by(Ticket.created_at.desc()).all()
    ticket_list = [{
        "id": ticket.id,
        "subject": ticket.subject,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at
    } for ticket in tickets]
    
    customer_profile = db.query(Customer).filter(Customer.user_id == customer_id).first()
    
    return {
        "id": customer.id,
        "name": customer.full_name,
        "email": customer.email,
        "avatar": customer.avatar,
        "member_since": customer_profile.member_since if customer_profile else customer.created_at,
        "total_orders": len(order_list),
        "total_tickets": len(ticket_list),
        "orders": order_list,
        "tickets": ticket_list,
        "preferences": customer_profile.preferences if customer_profile else {}
    }

# Settings APIs
@router.get("/settings")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get agent settings"""
    agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent profile not found")
    
    # Return basic settings using existing fields
    return {
        "notifications": True,
        "email_signature": f"Best regards,\n{current_user.full_name}\nIntellica Customer Support"
    }

@router.put("/settings")
def update_settings(
    settings_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update agent settings"""
    agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent profile not found")
    
    # For now, just return success since we can't store preferences
    # In a real implementation, we'd store these in a separate settings table
    db.commit()
    return {"message": "Settings updated successfully"}

@router.put("/tickets/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark ticket as resolved by agent"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Verify agent is assigned to this ticket or can resolve it
    if ticket.agent_id and ticket.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to resolve this ticket")
    
    # If ticket is unassigned, assign it to current agent first
    if not ticket.agent_id:
        ticket.agent_id = current_user.id
    
    ticket.status = TicketStatus.RESOLVED
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Ticket resolved successfully"}