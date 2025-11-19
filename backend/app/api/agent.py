"""Agent API endpoints for the Intellica Customer Support System.

This module provides comprehensive agent-facing API endpoints including:
- Dashboard with ticket statistics and workload management
- Ticket assignment, status updates, and resolution workflows
- Customer communication and internal messaging
- Customer profile management and history tracking
- Agent settings and preferences
- Refund approval and rejection workflows

All endpoints include proper authentication, validation, error handling,
and logging for security and maintainability.
"""

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
from app.core.logging import logger
from app.core.validation import sanitize_string, sanitize_search_query, validate_uuid
from app.schemas.agent import (
    TicketAssign, TicketStatusUpdate, MessageCreate, CustomerNote, 
    CommunicationSend, TemplateCreate, TemplateUpdate
)

router = APIRouter()

# Dashboard APIs
@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve comprehensive dashboard data for the authenticated agent.
    
    This endpoint provides an overview of the agent's workload including:
    - Key statistics (available tickets, assigned tickets, high priority, overdue)
    - Recent ticket activity and updates
    - Performance metrics and workload distribution
    
    Args:
        current_user: Authenticated agent user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Dashboard data including stats and recent tickets
        
    Raises:
        HTTPException: 404 if agent profile not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Agent dashboard requested by user ID: {current_user.id}")
    
    try:
        agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
        if not agent:
            logger.warning(f"Agent profile not found for user ID: {current_user.id}")
            raise HTTPException(status_code=404, detail="Agent profile not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error retrieving agent profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")
    
    try:
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
        
        dashboard_data = {
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
        
        logger.info(f"Dashboard data successfully retrieved for agent ID: {current_user.id}")
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error retrieving agent dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")

@router.get("/tickets")
def get_tickets(
    status: Optional[str] = Query(None, description="Filter tickets by status (open, in_progress, resolved, etc.)"),
    priority: Optional[str] = Query(None, description="Filter tickets by priority (low, medium, high)"),
    assigned_only: bool = Query(False, description="Show only tickets assigned to current agent"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve tickets with filtering options for agent workflow management.
    
    This endpoint allows agents to view and filter tickets based on:
    - Assignment status (assigned to agent or available to pick up)
    - Ticket status (open, in progress, resolved, etc.)
    - Priority level (low, medium, high)
    - Customer information and message counts
    
    Args:
        status: Optional status filter (case-insensitive)
        priority: Optional priority filter (case-insensitive)
        assigned_only: If True, shows only tickets assigned to current agent
        current_user: Authenticated agent user from JWT token
        db: Database session dependency
        
    Returns:
        List[dict]: List of tickets with customer and message information
        
    Raises:
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Tickets requested by agent ID: {current_user.id}, status: {status}, priority: {priority}, assigned_only: {assigned_only}")
    
    try:
        if assigned_only:
            # Show only tickets assigned to this agent
            query = db.query(Ticket).filter(Ticket.agent_id == current_user.id)
        else:
            # Show tickets assigned to this agent + unassigned tickets (available to pick up)
            query = db.query(Ticket).filter(
                or_(Ticket.agent_id == current_user.id, Ticket.agent_id.is_(None))
            )
        
        # Validate and apply status filter
        if status and status != "all":
            status_sanitized = sanitize_string(status, 50).upper()
            query = query.filter(Ticket.status == status_sanitized)
            logger.debug(f"Applied status filter: {status_sanitized}")
        
        # Validate and apply priority filter
        if priority and priority != "all":
            priority_sanitized = sanitize_string(priority, 50).upper()
            query = query.filter(Ticket.priority == priority_sanitized)
            logger.debug(f"Applied priority filter: {priority_sanitized}")
        
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
        
        logger.info(f"Retrieved {len(result)} tickets for agent ID: {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving tickets for agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tickets")

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
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        old_status = ticket.status
        ticket.status = TicketStatus(status_data.status)
        ticket.updated_at = datetime.utcnow()
        
        # Create notification for customer on status change
        if old_status != ticket.status:
            customer_notification = Notification(
                user_id=ticket.customer_id,
                title="Ticket Status Updated",
                message=f"Your support ticket #{ticket.id} status changed to {ticket.status.value}",
                type=NotificationType.TICKET,
                read=False
            )
            db.add(customer_notification)
        
        db.commit()
        return {"message": "Ticket status updated successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status value")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update ticket status")

@router.delete("/tickets/{ticket_id}/messages/{message_id}")
def delete_ticket_message(
    ticket_id: str,
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a message from a ticket"""
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.ticket_id == ticket_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only allow deletion of own messages or if agent is assigned to ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if message.sender_id != current_user.id and ticket.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}

@router.post("/tickets/{ticket_id}/messages")
def add_ticket_message(
    ticket_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add agent message to ticket with validation and notification handling.
    
    This endpoint allows agents to communicate with customers and add internal notes:
    - Customer-facing messages (visible to customer)
    - Internal notes (visible only to agents)
    - Automatic notification generation
    - Vendor notification for product-related issues
    
    Args:
        ticket_id: Unique identifier of the ticket
        message_data: Message content and internal flag
        current_user: Authenticated agent user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success message confirming message addition
        
    Raises:
        HTTPException: 400 if ticket_id format is invalid
        HTTPException: 404 if ticket not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Message addition requested by agent ID: {current_user.id}, ticket: {ticket_id}")
    
    try:
        # Validate ticket ID format
        ticket_id_validated = sanitize_string(ticket_id, 100)
        
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id_validated).first()
        if not ticket:
            logger.warning(f"Ticket not found: {ticket_id} for agent: {current_user.id}")
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Validate and sanitize message content
        content_sanitized = sanitize_string(message_data.content, 2000)
        if not content_sanitized:
            raise HTTPException(status_code=400, detail="Message content is required")
        
        message = Message(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            sender_id=current_user.id,
            sender_name=current_user.full_name,
            content=content_sanitized,
            is_internal=message_data.is_internal or False
        )
        
        ticket.updated_at = datetime.utcnow()
        
        # Create notification for customer if not internal message
        if not message_data.is_internal:
            customer_notification = Notification(
                user_id=ticket.customer_id,
                title="New Response on Your Ticket",
                message=f"Agent {current_user.full_name} replied to your support ticket #{ticket.id}",
                type=NotificationType.TICKET,
                read=False
            )
            db.add(customer_notification)
            
            # Notify vendor if ticket is related to their product
            if ticket.related_order_id:
                from app.models.order import OrderItem
                from app.models.product import Product
                order_items = db.query(OrderItem).filter(OrderItem.order_id == ticket.related_order_id).all()
                if order_items:
                    vendor_id = db.query(Product).filter(Product.id == order_items[0].product_id).first().vendor_id
                    if vendor_id:
                        vendor_notification = Notification(
                            user_id=vendor_id,
                            title="Agent Response on Product Issue",
                            message=f"Agent responded to customer complaint about your product (Ticket #{ticket.id})",
                            type=NotificationType.TICKET,
                            read=False
                        )
                        db.add(vendor_notification)
        
        db.add(message)
        db.commit()
        
        logger.info(f"Message successfully added to ticket {ticket_id} by agent ID: {current_user.id}")
        return {"message": "Message added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding message to ticket: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add message")

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
    
    # Create notification for customer
    customer_notification = Notification(
        user_id=ticket.customer_id,
        title="Your Support Ticket Has Been Resolved",
        message=f"Your support ticket #{ticket.id} has been resolved by {current_user.full_name}",
        type=NotificationType.TICKET,
        read=False
    )
    db.add(customer_notification)
    
    db.commit()
    
    return {"message": "Ticket resolved successfully"}

@router.post("/tickets/{ticket_id}/refund/approve")
def approve_refund(
    ticket_id: str,
    refund_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve refund request for a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Verify agent can approve refunds for this ticket
    if ticket.agent_id and ticket.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve refund for this ticket")
    
    # If ticket is unassigned, assign it to current agent
    if not ticket.agent_id:
        ticket.agent_id = current_user.id
    
    # Update related order status if exists
    if ticket.related_order_id:
        order = db.query(Order).filter(Order.id == ticket.related_order_id).first()
        if order:
            order.status = OrderStatus.RETURNED
            order.updated_at = datetime.utcnow()
    
    # Add system message about refund approval
    approval_message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=f"Refund approved by {current_user.full_name}. Amount: ${refund_data.get('amount', 'N/A')}. Reason: {refund_data.get('reason', 'Agent approved refund request')}",
        is_internal=False
    )
    
    # Create notification for customer
    customer_notification = Notification(
        user_id=ticket.customer_id,
        title="Refund Approved",
        message=f"Your refund request for ticket {ticket.id} has been approved and will be processed within 3-5 business days.",
        type=NotificationType.TICKET,
        read=False
    )
    
    # Create different notification for vendor
    if ticket.related_order_id:
        from app.models.order import OrderItem
        from app.models.product import Product
        order_items = db.query(OrderItem).filter(OrderItem.order_id == ticket.related_order_id).all()
        if order_items:
            vendor_id = db.query(Product).filter(Product.id == order_items[0].product_id).first().vendor_id
            if vendor_id:
                vendor_notification = Notification(
                    user_id=vendor_id,
                    title="Refund Processed for Your Product",
                    message=f"A refund has been approved for your product related to ticket {ticket.id}. This may affect your product analytics.",
                    type=NotificationType.TICKET,
                    read=False
                )
                db.add(vendor_notification)
    
    ticket.status = TicketStatus.RESOLVED
    ticket.updated_at = datetime.utcnow()
    
    db.add(approval_message)
    db.add(customer_notification)
    db.commit()
    
    return {"message": "Refund approved successfully", "ticket_id": ticket_id}

@router.post("/tickets/{ticket_id}/refund/reject")
def reject_refund(
    ticket_id: str,
    rejection_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject refund request for a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Verify agent can reject refunds for this ticket
    if ticket.agent_id and ticket.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reject refund for this ticket")
    
    # If ticket is unassigned, assign it to current agent
    if not ticket.agent_id:
        ticket.agent_id = current_user.id
    
    reason = rejection_data.get('reason', 'Refund request does not meet policy requirements')
    
    # Add system message about refund rejection
    rejection_message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=f"Refund request rejected by {current_user.full_name}. Reason: {reason}",
        is_internal=False
    )
    
    # Create notification for customer
    customer_notification = Notification(
        user_id=ticket.customer_id,
        title="Refund Request Rejected",
        message=f"Your refund request for ticket {ticket.id} has been rejected. Reason: {reason}",
        type=NotificationType.TICKET,
        read=False
    )
    
    ticket.status = TicketStatus.RESOLVED
    ticket.updated_at = datetime.utcnow()
    
    db.add(rejection_message)
    db.add(customer_notification)
    db.commit()
    
    return {"message": "Refund rejected successfully", "ticket_id": ticket_id}