from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import os
import shutil
from sqlalchemy import func, extract

from app.database import get_db
from app.models.user import User, Customer
from app.models.order import Order, OrderItem, OrderStatus, TrackingInfo
from app.models.ticket import Ticket, Message, TicketStatus, TicketPriority
from app.models.product import Product, ProductComplaint, ComplaintStatus
from app.models.analytics import Notification, NotificationType
from app.services.auth import get_current_user
from app.schemas.customer import (
    TicketCreate, MessageCreate, ReturnRequest, ProfileUpdate
)

router = APIRouter(prefix="/customer", tags=["customer"])

# Dashboard APIs
@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get customer dashboard data"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    # Get statistics
    open_tickets = db.query(Ticket).filter(
        Ticket.customer_id == current_user.id,
        Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
    ).count()
    
    active_orders = db.query(Order).filter(
        Order.customer_id == current_user.id,
        Order.status.in_([OrderStatus.PROCESSING, OrderStatus.SHIPPED])
    ).count()
    
    resolved_tickets = db.query(Ticket).filter(
        Ticket.customer_id == current_user.id,
        Ticket.status == TicketStatus.RESOLVED
    ).count()
    
    # Get recent orders (last 3)
    recent_orders = db.query(Order).filter(
        Order.customer_id == current_user.id
    ).order_by(Order.created_at.desc()).limit(3).all()
    
    # Get recent tickets (last 3)
    recent_tickets = db.query(Ticket).filter(
        Ticket.customer_id == current_user.id
    ).order_by(Ticket.created_at.desc()).limit(3).all()
    
    # Get monthly order data for last 6 months
    six_months_ago = datetime.now() - timedelta(days=180)
    monthly_orders = db.query(
        extract('month', Order.created_at).label('month'),
        func.count(Order.id).label('count'),
        func.sum(Order.total).label('total')
    ).filter(
        Order.customer_id == current_user.id,
        Order.created_at >= six_months_ago
    ).group_by(extract('month', Order.created_at)).all()
    
    # Get ticket status distribution
    ticket_stats = db.query(
        Ticket.status,
        func.count(Ticket.id).label('count')
    ).filter(
        Ticket.customer_id == current_user.id
    ).group_by(Ticket.status).all()
    
    return {
        "stats": {
            "open_tickets": open_tickets,
            "active_orders": active_orders,
            "pending_refunds": 0,
            "resolved_tickets": resolved_tickets
        },
        "charts": {
            "monthly_orders": [{
                "month": f"Month {int(row.month)}",
                "orders": row.count,
                "spending": float(row.total or 0)
            } for row in monthly_orders],
            "ticket_status": [{
                "status": row.status.value if hasattr(row.status, 'value') else str(row.status),
                "count": row.count
            } for row in ticket_stats]
        },
        "recent_orders": [{
            "id": order.id,
            "status": order.status,
            "total": order.total,
            "created_at": order.created_at,
            "item_count": db.query(OrderItem).filter(OrderItem.order_id == order.id).count()
        } for order in recent_orders],
        "recent_tickets": [{
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at
        } for ticket in recent_tickets]
    }

# Orders APIs
@router.get("/orders")
def get_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer orders with filtering"""
    query = db.query(Order).filter(Order.customer_id == current_user.id)
    
    if status and status != "all":
        # Handle case-insensitive status filtering
        status_upper = status.upper()
        query = query.filter(Order.status == status_upper)
    
    if search:
        query = query.filter(Order.id.contains(search))
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        result.append({
            "id": order.id,
            "status": order.status,
            "total": order.total,
            "created_at": order.created_at,
            "estimated_delivery": order.estimated_delivery,
            "tracking_number": order.tracking_number,
            "items": [{
                "id": item.id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
                "subtotal": item.subtotal
            } for item in items]
        })
    
    return result

@router.get("/orders/{order_id}")
def get_order_details(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific order details"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    tracking = db.query(TrackingInfo).filter(TrackingInfo.tracking_number == order.tracking_number).first()
    
    return {
        "id": order.id,
        "status": order.status,
        "total": order.total,
        "created_at": order.created_at,
        "estimated_delivery": order.estimated_delivery,
        "tracking_number": order.tracking_number,
        "items": [{
            "id": item.id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "price": item.price,
            "subtotal": item.subtotal
        } for item in items],
        "tracking": {
            "current_location": tracking.current_location if tracking else "Processing",
            "status": tracking.status if tracking else "Order Received",
            "courier_name": tracking.courier_name if tracking else "FastShip Express",
            "courier_contact": tracking.courier_contact if tracking else "+91-1800-123-4567"
        } if tracking else None
    }

@router.get("/orders/track/{order_id}")
def track_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get order tracking information"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    tracking = db.query(TrackingInfo).filter(TrackingInfo.tracking_number == order.tracking_number).first()
    
    # Generate tracking steps based on order status
    steps = [
        {"label": "Order Placed", "completed": True, "current": False},
        {"label": "Payment Confirmed", "completed": True, "current": False},
        {"label": "Packed", "completed": order.status != OrderStatus.PROCESSING, "current": order.status == OrderStatus.PROCESSING},
        {"label": "Shipped", "completed": order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED], "current": order.status == OrderStatus.SHIPPED},
        {"label": "Delivered", "completed": order.status == OrderStatus.DELIVERED, "current": order.status == OrderStatus.DELIVERED}
    ]
    
    # Get order items
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return {
        "order_id": order.id,
        "status": order.status,
        "tracking_number": order.tracking_number,
        "current_location": tracking.current_location if tracking else "Warehouse - Packing",
        "estimated_delivery": order.estimated_delivery,
        "courier_name": tracking.courier_name if tracking else "FastShip Express",
        "courier_contact": tracking.courier_contact if tracking else "+91-1800-123-4567",
        "total": order.total,
        "items": [{
            "id": item.id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "price": item.price,
            "subtotal": item.subtotal
        } for item in items],
        "steps": steps
    }

@router.post("/orders/return")
def request_return(
    return_request: ReturnRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request order return/refund"""
    order = db.query(Order).filter(
        Order.id == return_request.order_id,
        Order.customer_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != OrderStatus.DELIVERED:
        raise HTTPException(status_code=400, detail="Only delivered orders can be returned")
    
    # Calculate refund amount
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    total_items = len(order_items)
    returned_items = len(return_request.items)
    refund_amount = round((order.total / total_items) * returned_items, 2)
    
    # Create a support ticket for the return request
    ticket = Ticket(
        id=str(uuid.uuid4()),
        customer_id=current_user.id,
        subject=f"Return Request for Order {return_request.order_id}",
        status=TicketStatus.OPEN,
        priority=TicketPriority.MEDIUM,
        related_order_id=return_request.order_id
    )
    
    db.add(ticket)
    db.flush()
    
    # Add initial message with refund details
    message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=f"Return request for items: {', '.join(return_request.items)}. Reason: {return_request.reason}. {return_request.description or ''}\n\nEstimated refund amount: ${refund_amount}"
    )
    
    db.add(message)
    
    # Update order status to indicate return requested
    order.status = OrderStatus.RETURNED
    
    db.commit()
    
    return {
        "ticket_id": ticket.id, 
        "message": "Return request submitted successfully",
        "refund_amount": refund_amount,
        "status": "pending_approval"
    }

# Tickets APIs
@router.get("/tickets")
def get_tickets(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer tickets with filtering"""
    query = db.query(Ticket).filter(Ticket.customer_id == current_user.id)
    
    if status and status != "all":
        # Handle case-insensitive status filtering
        status_upper = status.upper()
        query = query.filter(Ticket.status == status_upper)
    
    if search:
        query = query.filter(
            (Ticket.subject.contains(search)) | (Ticket.id.contains(search))
        )
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    result = []
    for ticket in tickets:
        message_count = db.query(Message).filter(Message.ticket_id == ticket.id).count()
        result.append({
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
            "related_order_id": ticket.related_order_id,
            "message_count": message_count
        })
    
    return result

@router.post("/tickets")
def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new support ticket"""
    ticket = Ticket(
        id=str(uuid.uuid4()),
        customer_id=current_user.id,
        subject=ticket_data.subject,
        status=TicketStatus.OPEN,
        priority=TicketPriority(ticket_data.priority),
        related_order_id=ticket_data.order_id if ticket_data.order_id and ticket_data.order_id != "none" else None
    )
    
    db.add(ticket)
    db.flush()
    
    # Add initial message
    message_content = ticket_data.description
    if ticket_data.order_id:
        message_content += f"\n\nRelated Order: {ticket_data.order_id}"
    
    message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=message_content
    )
    
    db.add(message)
    db.commit()
    
    return {"ticket_id": ticket.id, "message": "Ticket created successfully"}

@router.get("/tickets/{ticket_id}")
def get_ticket_details(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ticket details with messages"""
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.customer_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    messages = db.query(Message).filter(
        Message.ticket_id == ticket.id
    ).order_by(Message.created_at).all()
    
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "related_order_id": ticket.related_order_id,
        "messages": [{
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender_name,
            "content": msg.content,
            "timestamp": msg.created_at,
            "is_internal": msg.is_internal,
            "sender_type": "customer" if msg.sender_id == current_user.id else "agent"
        } for msg in messages]
    }

@router.post("/tickets/{ticket_id}/messages")
def add_ticket_message(
    ticket_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add message to ticket"""
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.customer_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=message_data.content
    )
    
    # Update ticket timestamp
    ticket.updated_at = datetime.utcnow()
    
    db.add(message)
    db.commit()
    
    return {"message": "Message added successfully"}

@router.post("/tickets/{ticket_id}/attachments")
def upload_ticket_attachment(
    ticket_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload attachments to ticket"""
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.customer_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Create uploads directory if it doesn't exist
    upload_dir = f"uploads/tickets/{ticket_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    uploaded_files = []
    
    for file in files:
        # Validate file type
        allowed_types = ['.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_types:
            raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed")
        
        # Validate file size (10MB max)
        if file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
        
            # Save file
        file_path = os.path.join(upload_dir, file.filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except (OSError, IOError) as e:
            raise HTTPException(status_code=500, detail="Failed to save file")
        
        uploaded_files.append({
            "filename": file.filename,
            "size": file.size,
            "path": file_path
        })
    
    # Add message about attachments
    message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=f"Uploaded {len(uploaded_files)} attachment(s): {', '.join([f['filename'] for f in uploaded_files])}"
    )
    
    db.add(message)
    db.commit()
    
    return {"message": f"Successfully uploaded {len(uploaded_files)} file(s)", "files": uploaded_files}

# Profile APIs
@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer profile"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    # Get real-time counts
    total_orders = db.query(Order).filter(Order.customer_id == current_user.id).count()
    total_tickets = db.query(Ticket).filter(Ticket.customer_id == current_user.id).count()
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "avatar": current_user.avatar,
        "preferences": customer.preferences,
        "total_orders": total_orders,
        "total_tickets": total_tickets,
        "member_since": current_user.created_at
    }

@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update customer profile"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    if profile_data.full_name:
        current_user.full_name = profile_data.full_name
    
    if profile_data.preferences:
        customer.preferences = profile_data.preferences
    
    db.commit()
    
    return {"message": "Profile updated successfully"}

# Settings APIs
@router.get("/settings")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer settings"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    # Default settings structure
    default_settings = {
        "notifications": {
            "email": True,
            "order_updates": True,
            "support_replies": True
        }
    }
    
    # If no preferences stored, return defaults
    if not customer.preferences:
        return default_settings
    
    # Merge stored preferences with defaults to ensure all fields exist
    settings = default_settings.copy()
    if isinstance(customer.preferences, dict):
        # Update with stored preferences
        if "notifications" in customer.preferences and isinstance(customer.preferences["notifications"], dict):
            settings["notifications"].update(customer.preferences["notifications"])
        # Add any other top-level settings
        for key, value in customer.preferences.items():
            if key != "notifications":
                settings[key] = value
    
    return settings

@router.put("/settings")
def update_settings(
    settings_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update customer settings"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    # Update preferences with new settings
    current_preferences = customer.preferences or {}
    current_preferences.update(settings_data)
    customer.preferences = current_preferences
    
    db.commit()
    
    return {"message": "Settings updated successfully"}

# Notifications APIs
@router.get("/notifications")
def get_notifications(
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer notifications"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.read == False)
    
    notifications = query.order_by(Notification.timestamp.desc()).limit(50).all()
    
    return [{
        "id": notif.id,
        "title": notif.title,
        "message": notif.message,
        "type": notif.type,
        "read": notif.read,
        "timestamp": notif.timestamp
    } for notif in notifications]

@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}
