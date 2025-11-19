"""Customer API endpoints for the Intellica Customer Support System.

This module provides comprehensive customer-facing API endpoints including:
- Dashboard analytics and overview
- Order management and tracking
- Support ticket system
- Profile and settings management
- Notification system
- File upload capabilities

All endpoints include proper authentication, validation, error handling,
and logging for security and maintainability.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import os
import re
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
from app.core.logging import logger
from app.core.validation import sanitize_string, validate_email, validate_uuid, sanitize_search_query

router = APIRouter()

# Dashboard APIs
@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve comprehensive dashboard data for the authenticated customer.
    
    This endpoint provides an overview of the customer's account including:
    - Key statistics (open tickets, active orders, resolved tickets)
    - Recent orders and tickets
    - Monthly order trends and spending patterns
    - Ticket status distribution
    
    Args:
        current_user: Authenticated user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Dashboard data including stats, charts, recent orders and tickets
        
    Raises:
        HTTPException: 404 if customer profile not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Dashboard requested by customer ID: {current_user.id}")
    
    try:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer:
            logger.warning(f"Customer profile not found for user ID: {current_user.id}")
            raise HTTPException(status_code=404, detail="Customer profile not found")
    except Exception as e:
        logger.error(f"Database error retrieving customer profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve customer data")
    
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
    
    dashboard_data = {
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
    
    logger.info(f"Dashboard data successfully retrieved for customer ID: {current_user.id}")
    return dashboard_data

# Orders APIs
@router.get("/orders")
def get_orders(
    status: Optional[str] = Query(None, description="Filter orders by status (processing, shipped, delivered, etc.)"),
    search: Optional[str] = Query(None, description="Search orders by order ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve customer orders with optional filtering and search capabilities.
    
    This endpoint allows customers to view their order history with the ability to:
    - Filter by order status (processing, shipped, delivered, etc.)
    - Search by order ID
    - View order items and details
    
    Args:
        status: Optional status filter (case-insensitive)
        search: Optional search term for order ID
        current_user: Authenticated user from JWT token
        db: Database session dependency
        
    Returns:
        List[dict]: List of orders with items and details
        
    Raises:
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Orders requested by customer ID: {current_user.id}, status: {status}, search: {search}")
    
    try:
        query = db.query(Order).filter(Order.customer_id == current_user.id)
        
        # Validate and apply status filter
        if status and status != "all":
            status_sanitized = sanitize_string(status, 50).upper()
            query = query.filter(Order.status == status_sanitized)
            logger.debug(f"Applied status filter: {status_sanitized}")
        
        # Validate and apply search filter
        if search:
            search_sanitized = sanitize_search_query(search)
            query = query.filter(Order.id.contains(search_sanitized))
            logger.debug(f"Applied search filter: {search_sanitized}")
    except Exception as e:
        logger.error(f"Error building order query: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orders")
    
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
    """
    Retrieve detailed information for a specific customer order.
    
    This endpoint provides comprehensive order details including:
    - Order status and timestamps
    - All order items with quantities and prices
    - Tracking information if available
    - Delivery estimates
    
    Args:
        order_id: Unique identifier for the order
        current_user: Authenticated user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Complete order details with items and tracking
        
    Raises:
        HTTPException: 400 if order_id format is invalid
        HTTPException: 404 if order not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Order details requested by customer ID: {current_user.id}, order: {order_id}")
    
    try:
        # Validate order ID format
        order_id_validated = sanitize_string(order_id, 100)
        
        order = db.query(Order).filter(
            Order.id == order_id_validated,
            Order.customer_id == current_user.id
        ).first()
        
        if not order:
            logger.warning(f"Order not found: {order_id} for customer: {current_user.id}")
            raise HTTPException(status_code=404, detail="Order not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving order details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve order details")
    
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
    """
    Retrieve comprehensive order tracking information with delivery progress.
    
    This endpoint provides real-time tracking data including:
    - Current order status and location
    - Delivery progress steps with completion status
    - Courier information and contact details
    - Estimated delivery dates
    - Complete order item details
    
    Args:
        order_id: Unique identifier for the order to track
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Complete tracking information with steps and courier details
        
    Raises:
        HTTPException: 400 if order_id format is invalid
        HTTPException: 404 if order not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Order tracking requested by customer ID: {current_user.id}, order: {order_id}")
    
    try:
        # Validate order ID format
        order_id_validated = sanitize_string(order_id, 100)
        
        order = db.query(Order).filter(
            Order.id == order_id_validated,
            Order.customer_id == current_user.id
        ).first()
        
        if not order:
            logger.warning(f"Order not found for tracking: {order_id} for customer: {current_user.id}")
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
        
        tracking_data = {
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
        
        logger.info(f"Order tracking data retrieved successfully for order: {order_id}")
        return tracking_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving order tracking: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tracking information")

@router.post("/orders/return")
def request_return(
    return_request: ReturnRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a return/refund request for delivered orders with validation.
    
    This endpoint allows customers to request returns for delivered orders:
    - Validates order ownership and delivery status
    - Calculates estimated refund amounts
    - Creates support ticket for return processing
    - Updates order status to reflect return request
    - Generates tracking information for the return process
    
    Args:
        return_request: Return request data (order_id, items, reason, description)
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Return request confirmation with ticket ID and refund amount
        
    Raises:
        HTTPException: 400 if order cannot be returned or validation fails
        HTTPException: 404 if order not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Return request submitted by customer ID: {current_user.id}, order: {return_request.order_id}")
    
    try:
        # Validate and sanitize order ID
        order_id_validated = sanitize_string(return_request.order_id, 100)
        
        order = db.query(Order).filter(
            Order.id == order_id_validated,
            Order.customer_id == current_user.id
        ).first()
        
        if not order:
            logger.warning(f"Order not found for return: {return_request.order_id} for customer: {current_user.id}")
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.status != OrderStatus.DELIVERED:
            logger.warning(f"Invalid return attempt for non-delivered order: {order.id}")
            raise HTTPException(status_code=400, detail="Only delivered orders can be returned")
        
        # Validate return items
        if not return_request.items or len(return_request.items) == 0:
            raise HTTPException(status_code=400, detail="At least one item must be selected for return")
        
        # Sanitize reason and description
        reason_sanitized = sanitize_string(return_request.reason, 200)
        description_sanitized = sanitize_string(return_request.description or "", 1000)
        
        if not reason_sanitized:
            raise HTTPException(status_code=400, detail="Return reason is required")
        
        # Calculate refund amount
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        total_items = len(order_items)
        returned_items = len(return_request.items)
        refund_amount = round((order.total / max(total_items, 1)) * returned_items, 2)
        
        # Create a support ticket for the return request
        ticket = Ticket(
            id=str(uuid.uuid4()),
            customer_id=current_user.id,
            subject=f"Return Request for Order {order_id_validated}",
            status=TicketStatus.OPEN,
            priority=TicketPriority.MEDIUM,
            related_order_id=order_id_validated
        )
        
        db.add(ticket)
        db.flush()
        
        # Add initial message with sanitized content
        message_content = f"Return request for items: {', '.join(return_request.items)}. Reason: {reason_sanitized}."
        if description_sanitized:
            message_content += f" Description: {description_sanitized}"
        message_content += f"\n\nEstimated refund amount: ${refund_amount}"
        
        message = Message(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            sender_id=current_user.id,
            sender_name=current_user.full_name,
            content=message_content
        )
        
        db.add(message)
        
        # Update order status to indicate return requested
        order.status = OrderStatus.RETURNED
        
        db.commit()
        
        return_data = {
            "ticket_id": ticket.id, 
            "message": "Return request submitted successfully",
            "refund_amount": refund_amount,
            "status": "pending_approval"
        }
        
        logger.info(f"Return request processed successfully: ticket {ticket.id} for order {order.id}")
        return return_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing return request: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process return request")

# Tickets APIs
@router.get("/tickets")
def get_tickets(
    status: Optional[str] = Query(None, description="Filter tickets by status (open, in_progress, resolved, etc.)"),
    search: Optional[str] = Query(None, description="Search tickets by subject or ticket ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve customer support tickets with optional filtering and search.
    
    This endpoint allows customers to view their support ticket history with:
    - Status-based filtering (open, in_progress, resolved, closed)
    - Search functionality by ticket subject or ID
    - Message count for each ticket
    - Complete ticket metadata and timestamps
    
    Args:
        status: Optional status filter (case-insensitive)
        search: Optional search term for ticket subject or ID
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        List[dict]: List of tickets with metadata and message counts
        
    Raises:
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Tickets requested by customer ID: {current_user.id}, status: {status}, search: {search}")
    
    try:
        query = db.query(Ticket).filter(Ticket.customer_id == current_user.id)
        
        # Validate and apply status filter
        if status and status != "all":
            status_sanitized = sanitize_string(status, 50).upper()
            query = query.filter(Ticket.status == status_sanitized)
            logger.debug(f"Applied status filter: {status_sanitized}")
        
        # Validate and apply search filter
        if search:
            search_sanitized = sanitize_search_query(search)
            query = query.filter(
                (Ticket.subject.contains(search_sanitized)) | (Ticket.id.contains(search_sanitized))
            )
            logger.debug(f"Applied search filter: {search_sanitized}")
        
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
        
        logger.info(f"Retrieved {len(result)} tickets for customer ID: {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving customer tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tickets")

@router.post("/tickets")
def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new customer support ticket.
    
    This endpoint allows customers to create support tickets for various issues:
    - Order-related problems
    - Product defects or complaints
    - General inquiries
    - Refund requests
    
    The ticket is automatically assigned OPEN status and can be linked to an order.
    
    Args:
        ticket_data: Ticket creation data (subject, description, priority, order_id)
        current_user: Authenticated user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Created ticket ID and success message
        
    Raises:
        HTTPException: 400 if ticket data validation fails
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Ticket creation requested by customer ID: {current_user.id}")
    
    try:
        # Validate and sanitize ticket data
        subject_sanitized = sanitize_string(ticket_data.subject, 200)
        description_sanitized = sanitize_string(ticket_data.description, 2000)
        
        if not subject_sanitized:
            raise HTTPException(status_code=400, detail="Ticket subject is required")
        
        if not description_sanitized:
            raise HTTPException(status_code=400, detail="Ticket description is required")
        
        # Validate order ID if provided
        order_id = None
        if ticket_data.order_id and ticket_data.order_id != "none":
            order_id = sanitize_string(ticket_data.order_id, 100)
            # Verify order belongs to customer
            order_exists = db.query(Order).filter(
                Order.id == order_id,
                Order.customer_id == current_user.id
            ).first()
            if not order_exists:
                logger.warning(f"Invalid order ID provided: {order_id} for customer: {current_user.id}")
                raise HTTPException(status_code=400, detail="Invalid order ID")
        
        ticket = Ticket(
            id=str(uuid.uuid4()),
            customer_id=current_user.id,
            subject=subject_sanitized,
            status=TicketStatus.OPEN,
            priority=TicketPriority(ticket_data.priority),
            related_order_id=order_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")
    
    db.add(ticket)
    db.flush()
    
    # Add initial message with sanitized content
    message_content = description_sanitized
    if order_id:
        message_content += f"\n\nRelated Order: {order_id}"
    
    message = Message(
        id=str(uuid.uuid4()),
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        content=message_content
    )
    
    db.add(message)
    db.commit()
    
    logger.info(f"Ticket created successfully: {ticket.id} for customer: {current_user.id}")
    return {"ticket_id": ticket.id, "message": "Ticket created successfully"}

@router.get("/tickets/{ticket_id}")
def get_ticket_details(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive details for a specific support ticket.
    
    This endpoint provides complete ticket information including:
    - Ticket metadata (subject, status, priority, timestamps)
    - Complete message history with sender information
    - Related order information if applicable
    - Message threading and conversation flow
    
    Args:
        ticket_id: Unique identifier for the support ticket
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Complete ticket details with message history
        
    Raises:
        HTTPException: 400 if ticket_id format is invalid
        HTTPException: 404 if ticket not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Ticket details requested by customer ID: {current_user.id}, ticket: {ticket_id}")
    
    try:
        # Validate ticket ID format
        ticket_id_validated = sanitize_string(ticket_id, 100)
        
        ticket = db.query(Ticket).filter(
            Ticket.id == ticket_id_validated,
            Ticket.customer_id == current_user.id
        ).first()
        
        if not ticket:
            logger.warning(f"Ticket not found: {ticket_id} for customer: {current_user.id}")
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        messages = db.query(Message).filter(
            Message.ticket_id == ticket.id
        ).order_by(Message.created_at).all()
        
        ticket_data = {
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
        
        logger.info(f"Ticket details retrieved successfully: {ticket_id} with {len(messages)} messages")
        return ticket_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving ticket details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve ticket details")

@router.delete("/tickets/{ticket_id}/messages/{message_id}")
def delete_ticket_message(
    ticket_id: str,
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a customer message from a ticket"""
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.ticket_id == ticket_id,
        Message.sender_id == current_user.id  # Only allow customers to delete their own messages
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found or not authorized")
    
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
    Add a customer message to an existing support ticket.
    
    This endpoint allows customers to continue conversations on their tickets:
    - Validates ticket ownership and existence
    - Sanitizes message content for security
    - Updates ticket timestamp to reflect recent activity
    - Maintains conversation threading
    
    Args:
        ticket_id: Unique identifier for the support ticket
        message_data: Message content data
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success confirmation message
        
    Raises:
        HTTPException: 400 if message content is invalid
        HTTPException: 404 if ticket not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Message addition requested by customer ID: {current_user.id}, ticket: {ticket_id}")
    
    try:
        # Validate ticket ID format
        ticket_id_validated = sanitize_string(ticket_id, 100)
        
        ticket = db.query(Ticket).filter(
            Ticket.id == ticket_id_validated,
            Ticket.customer_id == current_user.id
        ).first()
        
        if not ticket:
            logger.warning(f"Ticket not found for message: {ticket_id} for customer: {current_user.id}")
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
            content=content_sanitized
        )
        
        # Update ticket timestamp
        ticket.updated_at = datetime.utcnow()
        
        db.add(message)
        db.commit()
        
        logger.info(f"Message successfully added to ticket {ticket_id} by customer ID: {current_user.id}")
        return {"message": "Message added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding message to ticket: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add message")

@router.post("/tickets/{ticket_id}/attachments")
def upload_ticket_attachment(
    ticket_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload file attachments to a support ticket with comprehensive validation.
    
    This endpoint allows customers to attach files to their support tickets:
    - Validates file types and sizes for security
    - Creates secure file storage with organized directory structure
    - Supports multiple file uploads in a single request
    - Automatically logs attachment activity in ticket conversation
    
    Supported file types: PNG, JPG, JPEG, PDF, DOC, DOCX, TXT
    Maximum file size: 10MB per file
    
    Args:
        ticket_id: Unique identifier for the support ticket
        files: List of files to upload (multipart/form-data)
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Upload confirmation with file details
        
    Raises:
        HTTPException: 400 if file validation fails
        HTTPException: 404 if ticket not found or doesn't belong to customer
        HTTPException: 500 if file storage operation fails
    """
    logger.info(f"File upload requested by customer ID: {current_user.id}, ticket: {ticket_id}, files: {len(files)}")
    
    try:
        # Validate ticket ID format
        ticket_id_validated = sanitize_string(ticket_id, 100)
        
        ticket = db.query(Ticket).filter(
            Ticket.id == ticket_id_validated,
            Ticket.customer_id == current_user.id
        ).first()
        
        if not ticket:
            logger.warning(f"Ticket not found for file upload: {ticket_id} for customer: {current_user.id}")
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Validate file count
        if len(files) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 files allowed per upload")
        
        # Create uploads directory if it doesn't exist
        upload_dir = f"uploads/tickets/{ticket_id_validated}"
        os.makedirs(upload_dir, exist_ok=True)
        
        uploaded_files = []
        
        for file in files:
            # Validate file has a name
            if not file.filename:
                raise HTTPException(status_code=400, detail="File must have a filename")
            
            # Clean filename and handle duplicates with counter
            name, ext = os.path.splitext(file.filename)
            # Remove dangerous characters but keep safe ones like parentheses
            original_name = re.sub(r'[<>:"/\\|?*]', '', name.strip())[:200]
            filename_clean = f"{original_name}{ext}"
            
            # Check for duplicates and add counter
            counter = 1
            while os.path.exists(os.path.join(upload_dir, filename_clean)):
                filename_clean = f"{original_name} ({counter}){ext}"
                counter += 1
            
            # Validate file type
            allowed_types = ['.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.txt']
            file_ext = os.path.splitext(filename_clean)[1].lower()
            
            if file_ext not in allowed_types:
                raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed. Allowed: {', '.join(allowed_types)}")
            
            # Validate file size (10MB max)
            if file.size and file.size > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
            
            # Save file with clean name
            file_path = os.path.join(upload_dir, filename_clean)
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
            except (OSError, IOError) as e:
                logger.error(f"Failed to save file {filename_clean}: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to save file")
            
            uploaded_files.append({
                "filename": filename_clean,
                "size": file.size or 0,
                "path": file_path
            })
        
        # Add message about attachments
        message = Message(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            sender_id=current_user.id,
            sender_name=current_user.full_name,
            content=', '.join([f['filename'] for f in uploaded_files])
        )
        
        db.add(message)
        db.commit()
        
        upload_result = {
            "message": f"Successfully uploaded {len(uploaded_files)} file(s)", 
            "files": uploaded_files
        }
        
        logger.info(f"Files successfully uploaded to ticket {ticket_id}: {[f['filename'] for f in uploaded_files]}")
        return upload_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading files to ticket: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload files")

# Profile APIs
@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive customer profile information.
    
    This endpoint provides complete customer profile data including:
    - Personal information (name, email, avatar)
    - Account statistics (total orders, tickets)
    - User preferences and settings
    - Account creation and membership information
    
    Args:
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Complete customer profile with statistics
        
    Raises:
        HTTPException: 404 if customer profile not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Profile requested by customer ID: {current_user.id}")
    
    try:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        
        if not customer:
            logger.warning(f"Customer profile not found for user ID: {current_user.id}")
            raise HTTPException(status_code=404, detail="Customer profile not found")
        
        # Get real-time counts
        total_orders = db.query(Order).filter(Order.customer_id == current_user.id).count()
        total_tickets = db.query(Ticket).filter(Ticket.customer_id == current_user.id).count()
        
        profile_data = {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "avatar": current_user.avatar,
            "preferences": customer.preferences,
            "total_orders": total_orders,
            "total_tickets": total_tickets,
            "member_since": current_user.created_at
        }
        
        logger.info(f"Profile successfully retrieved for customer ID: {current_user.id}")
        return profile_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving customer profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")

@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update customer profile information with validation.
    
    This endpoint allows customers to modify their profile data:
    - Updates personal information (full name)
    - Modifies user preferences and settings
    - Validates input data for security
    - Maintains data integrity and consistency
    
    Args:
        profile_data: Profile update data (full_name, preferences)
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success confirmation message
        
    Raises:
        HTTPException: 400 if validation fails
        HTTPException: 404 if customer profile not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Profile update requested by customer ID: {current_user.id}")
    
    try:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        
        if not customer:
            logger.warning(f"Customer profile not found for update: {current_user.id}")
            raise HTTPException(status_code=404, detail="Customer profile not found")
        
        # Validate and update full name if provided
        if profile_data.full_name:
            full_name_sanitized = sanitize_string(profile_data.full_name, 100)
            if not full_name_sanitized:
                raise HTTPException(status_code=400, detail="Full name cannot be empty")
            current_user.full_name = full_name_sanitized
        
        # Update preferences if provided
        if profile_data.preferences:
            customer.preferences = profile_data.preferences
        
        db.commit()
        
        logger.info(f"Profile successfully updated for customer ID: {current_user.id}")
        return {"message": "Profile updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer profile: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

# Settings APIs
@router.get("/settings")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve customer application settings and preferences.
    
    This endpoint provides access to customer-specific settings including:
    - Notification preferences (email, order updates, support replies)
    - Application preferences and customizations
    - Default settings for new customers
    - Merged settings ensuring all required fields exist
    
    Args:
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Customer settings with notification and application preferences
        
    Raises:
        HTTPException: 404 if customer profile not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Settings requested by customer ID: {current_user.id}")
    
    try:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        
        if not customer:
            logger.warning(f"Customer profile not found for settings: {current_user.id}")
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
            logger.debug(f"No preferences found for customer {current_user.id}, returning defaults")
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
        
        logger.info(f"Settings successfully retrieved for customer ID: {current_user.id}")
        return settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving customer settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve settings")

@router.put("/settings")
def update_settings(
    settings_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update customer application settings and preferences.
    
    This endpoint allows customers to modify their application settings:
    - Updates notification preferences
    - Modifies application behavior settings
    - Validates settings data structure
    - Merges with existing preferences to maintain data integrity
    
    Args:
        settings_data: Settings update data (notifications, preferences)
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success confirmation message
        
    Raises:
        HTTPException: 400 if settings data is invalid
        HTTPException: 404 if customer profile not found
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Settings update requested by customer ID: {current_user.id}")
    
    try:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        
        if not customer:
            logger.warning(f"Customer profile not found for settings update: {current_user.id}")
            raise HTTPException(status_code=404, detail="Customer profile not found")
        
        # Validate settings data structure
        if not isinstance(settings_data, dict):
            raise HTTPException(status_code=400, detail="Settings data must be a valid object")
        
        # Update preferences with new settings
        current_preferences = customer.preferences or {}
        current_preferences.update(settings_data)
        customer.preferences = current_preferences
        
        db.commit()
        
        logger.info(f"Settings successfully updated for customer ID: {current_user.id}")
        return {"message": "Settings updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer settings: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update settings")

# Notifications APIs
@router.get("/notifications")
def get_notifications(
    unread_only: bool = Query(False, description="Filter to show only unread notifications"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve customer notifications with optional filtering.
    
    This endpoint provides access to customer-specific notifications including:
    - Order status updates and delivery notifications
    - Support ticket responses and updates
    - System announcements and important alerts
    - Optional filtering for unread notifications only
    
    Args:
        unread_only: If True, returns only unread notifications
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        List[dict]: List of notifications with metadata and read status
        
    Raises:
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Notifications requested by customer ID: {current_user.id}, unread_only: {unread_only}")
    
    try:
        query = db.query(Notification).filter(Notification.user_id == current_user.id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
            logger.debug(f"Applied unread filter for customer {current_user.id}")
        
        notifications = query.order_by(Notification.timestamp.desc()).limit(50).all()
        
        notification_list = [{
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "read": notif.read,
            "timestamp": notif.timestamp
        } for notif in notifications]
        
        logger.info(f"Retrieved {len(notification_list)} notifications for customer ID: {current_user.id}")
        return notification_list
        
    except Exception as e:
        logger.error(f"Error retrieving customer notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve notifications")

@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific customer notification as read.
    
    This endpoint allows customers to update the read status of their notifications:
    - Validates notification ownership
    - Updates read status to prevent duplicate alerts
    - Maintains notification history for reference
    
    Args:
        notification_id: Unique identifier of the notification
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success confirmation message
        
    Raises:
        HTTPException: 404 if notification not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Mark read requested by customer ID: {current_user.id}, notification: {notification_id}")
    
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            logger.warning(f"Notification not found: {notification_id} for customer: {current_user.id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.read = True
        db.commit()
        
        logger.info(f"Notification {notification_id} marked as read for customer ID: {current_user.id}")
        return {"message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific customer notification permanently.
    
    This endpoint allows customers to remove notifications from their inbox:
    - Validates notification ownership before deletion
    - Permanently removes notification from database
    - Helps customers manage their notification inbox
    
    Args:
        notification_id: Unique identifier of the notification to delete
        current_user: Authenticated customer user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success confirmation message
        
    Raises:
        HTTPException: 404 if notification not found or doesn't belong to customer
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Notification deletion requested by customer ID: {current_user.id}, notification: {notification_id}")
    
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            logger.warning(f"Notification not found for deletion: {notification_id} for customer: {current_user.id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        db.delete(notification)
        db.commit()
        
        logger.info(f"Notification {notification_id} successfully deleted for customer ID: {current_user.id}")
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete notification")
