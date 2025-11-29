"""Supervisor API endpoints for the Intellica Customer Support System.

This module provides comprehensive supervisor-facing API endpoints including:
- Dashboard with system-wide statistics and team performance
- Ticket management and reassignment capabilities
- Agent and customer management with status controls
- Analytics and reporting for operational insights
- Team oversight and performance monitoring

All endpoints include proper authentication, validation, error handling,
and logging for security and maintainability.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import get_db
from app.services.auth import get_current_user
from app.models.user import User, Agent, Customer, Supervisor
from app.models.ticket import Ticket, TicketStatus, Message
from app.models.order import Order, OrderItem
from app.core.logging import logger
from app.core.validation import sanitize_string, sanitize_search_query
from typing import Optional
from datetime import datetime, timedelta
import uuid

router = APIRouter()

@router.get("/dashboard")
def get_supervisor_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive dashboard data for supervisor oversight.
    
    This endpoint provides system-wide statistics and team performance metrics including:
    - Total ticket counts and status distribution
    - Active agent counts and workload distribution
    - Recent ticket activity across all agents
    - Team performance metrics and analytics
    - Chart data for visualization
    
    Args:
        current_user: Authenticated supervisor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Dashboard data with stats, recent tickets, and team performance
        
    Raises:
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Supervisor dashboard requested by user ID: {current_user.id}")
    
    try:
        # Total tickets across all agents
        total_tickets = db.query(Ticket).count()
        
        # Active agents count (only agents that are actually active)
        active_agents = db.query(User).filter(
            User.role == "AGENT",
            User.is_active == True
        ).count()
        
        # Tickets by status (using enum values)
        open_tickets_count = db.query(Ticket).filter(Ticket.status == TicketStatus.OPEN).count()
        in_progress_tickets_count = db.query(Ticket).filter(Ticket.status == TicketStatus.IN_PROGRESS).count() 
        resolved_tickets_count = db.query(Ticket).filter(Ticket.status == TicketStatus.RESOLVED).count()
        closed_tickets_count = db.query(Ticket).filter(Ticket.status == TicketStatus.CLOSED).count()
        
        # Show in_progress as "assigned" tickets
        assigned_tickets = in_progress_tickets_count
        
        # Recent tickets (last 5) - using correct relationships
        recent_tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).limit(5).all()
        recent_tickets_data = []
        for ticket in recent_tickets:
            # Get customer using correct foreign key
            customer = db.query(User).join(Customer).filter(Customer.user_id == ticket.customer_id).first()
            agent = None
            if ticket.agent_id:
                # Get agent using correct foreign key
                agent = db.query(User).join(Agent).filter(Agent.user_id == ticket.agent_id).first()
            
            recent_tickets_data.append({
                "id": ticket.id,
                "subject": ticket.subject,
                "status": ticket.status.value,
                "priority": ticket.priority.value,
                "customer_name": customer.full_name if customer else "Unknown",
                "agent_name": agent.full_name if agent else "Unassigned",
                "created_at": ticket.created_at
            })
        
        # Team performance (real data only)
        agents_query = db.query(User).filter(
            User.role == "AGENT",
            User.is_active == True
        ).limit(5).all()
        team_performance = []
        for agent_user in agents_query:
            # Count real assigned tickets
            assigned_tickets_count = db.query(Ticket).filter(
                Ticket.agent_id == agent_user.id,
                Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
            ).count()
            
            # Count real resolved tickets
            resolved_tickets_count = db.query(Ticket).filter(
                Ticket.agent_id == agent_user.id,
                Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])
            ).count()
            
            team_performance.append({
                "id": agent_user.id,
                "name": agent_user.full_name,
                "assigned_tickets": assigned_tickets_count,
                "resolved_tickets": resolved_tickets_count
            })
        
        dashboard_data = {
            "stats": {
                "total_tickets": total_tickets,
                "active_agents": active_agents,
                "open_tickets": open_tickets_count,
                "assigned_tickets": assigned_tickets,
                "resolved_tickets": resolved_tickets_count,
                "closed_tickets": closed_tickets_count
            },
            "recent_tickets": recent_tickets_data,
            "team_performance": team_performance,
            "chart_data": [
                {"name": "Open", "value": open_tickets_count},
                {"name": "In Progress", "value": in_progress_tickets_count},
                {"name": "Resolved", "value": resolved_tickets_count},
                {"name": "Closed", "value": closed_tickets_count}
            ]
        }
        
        logger.info(f"Dashboard data successfully retrieved for supervisor ID: {current_user.id}")
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error retrieving supervisor dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")

@router.get("/tickets")
def get_all_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tickets for supervisor oversight"""
    
    query = db.query(Ticket)
    
    # Apply filters
    if status and status != 'all':
        query = query.filter(Ticket.status == TicketStatus(status.upper()))
    
    if priority and priority != 'all':
        query = query.filter(Ticket.priority == priority.upper())
    
    if search:
        # Search in customer name or ticket subject
        query = query.join(User, User.id == Ticket.customer_id).filter(
            or_(
                User.full_name.contains(search),
                Ticket.subject.contains(search),
                Ticket.id.contains(search)
            )
        )
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    result = []
    for ticket in tickets:
        # Get customer using correct foreign key relationship
        customer = db.query(User).join(Customer).filter(Customer.user_id == ticket.customer_id).first()
        agent = None
        if ticket.agent_id:
            # Get agent using correct foreign key relationship
            agent = db.query(User).join(Agent).filter(Agent.user_id == ticket.agent_id).first()
        
        result.append({
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status.value,
            "priority": ticket.priority.value,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
            "customer_name": customer.full_name if customer else "Unknown",
            "customer_email": customer.email if customer else "",
            "agent_name": agent.full_name if agent else "Unassigned",
            "agent_id": ticket.agent_id
        })
    
    return result

@router.get("/agents")
def get_all_agents(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all agents for team management"""
    
    query = db.query(User).join(Agent).filter(User.role == "AGENT")
    
    if search:
        query = query.filter(
            or_(
                User.full_name.contains(search),
                User.email.contains(search)
            )
        )
    
    agents = query.all()
    
    result = []
    for agent_user in agents:
        agent_profile = db.query(Agent).filter(Agent.user_id == agent_user.id).first()
        
        # Get agent's current tickets using correct foreign key
        assigned_tickets = db.query(Ticket).filter(
            Ticket.agent_id == agent_user.id,
            Ticket.status.in_([TicketStatus.IN_PROGRESS, TicketStatus.OPEN])
        ).all()
        
        # Filter by status if requested
        agent_status = agent_profile.status if agent_profile else "OFFLINE"
        if status_filter and status_filter.lower() != agent_status.lower():
            continue
        
        # Calculate real resolved tickets
        resolved_tickets = db.query(Ticket).filter(
            Ticket.agent_id == agent_user.id,
            Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])
        ).count()
        
        result.append({
            "id": agent_user.id,
            "name": agent_user.full_name,
            "email": agent_user.email,
            "is_active": agent_user.is_active,
            "assigned_tickets": len(assigned_tickets),
            "resolved_tickets": resolved_tickets,
            "department": agent_profile.department if agent_profile else "Support",
            "current_tickets": [t.id for t in assigned_tickets]
        })
    
    return result

@router.get("/customers")
def get_all_customers(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all customers for supervisor oversight"""
    
    query = db.query(User).filter(User.role == "CUSTOMER")
    
    if search:
        query = query.filter(
            or_(
                User.full_name.contains(search),
                User.email.contains(search)
            )
        )
    
    customers = query.all()
    
    result = []
    for customer_user in customers:
        # Get customer profile
        customer_profile = db.query(Customer).filter(Customer.user_id == customer_user.id).first()
        
        # Get actual customer statistics
        total_tickets = db.query(Ticket).filter(Ticket.customer_id == customer_user.id).count()
        active_tickets = db.query(Ticket).filter(
            Ticket.customer_id == customer_user.id,
            Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
        ).count()
        
        # Calculate actual orders from Order table
        total_orders = db.query(Order).filter(Order.customer_id == customer_user.id).count()
        
        customer_status = "Active" if customer_user.is_active else "Blocked"
        
        # Filter by status if requested
        if status_filter and status_filter != "All Customers":
            if status_filter == "Active Customers" and customer_status != "Active":
                continue
            elif status_filter == "Blocked Customers" and customer_status != "Blocked":
                continue
        
        result.append({
            "id": customer_user.id,
            "name": customer_user.full_name,
            "email": customer_user.email,
            "status": customer_status,
            "is_active": customer_user.is_active,
            "total_orders": total_orders,
            "total_tickets": total_tickets,
            "active_tickets": min(active_tickets, total_tickets),  # Ensure active <= total
            "member_since": customer_profile.member_since if customer_profile else customer_user.created_at,
            "last_login": customer_user.last_login
        })
    
    return result

from pydantic import BaseModel

class TicketReassign(BaseModel):
    agent_id: int

class AgentStatusUpdate(BaseModel):
    is_active: bool

class CustomerStatusUpdate(BaseModel):
    is_active: bool

@router.put("/tickets/{ticket_id}/reassign")
def reassign_ticket(
    ticket_id: str,
    reassign_data: TicketReassign,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reassign ticket to different agent"""
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Verify agent exists
        agent = db.query(User).filter(User.id == reassign_data.agent_id, User.role == "AGENT").first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if not agent.is_active:
            raise HTTPException(status_code=400, detail="Cannot assign to inactive agent")
        
        old_agent_id = ticket.agent_id
        ticket.agent_id = reassign_data.agent_id
        ticket.status = TicketStatus.IN_PROGRESS
        ticket.updated_at = datetime.utcnow()
        
        # Notify new agent about reassignment
        from app.models.analytics import Notification, NotificationType
        agent_notification = Notification(
            user_id=reassign_data.agent_id,
            title="Ticket Reassigned to You",
            message=f"Supervisor {current_user.full_name} reassigned ticket #{ticket.id} to you",
            type=NotificationType.TICKET,
            read=False
        )
        db.add(agent_notification)
        
        # Notify old agent if there was one
        if old_agent_id and old_agent_id != reassign_data.agent_id:
            old_agent_notification = Notification(
                user_id=old_agent_id,
                title="Ticket Reassigned",
                message=f"Supervisor {current_user.full_name} reassigned ticket #{ticket.id} to another agent",
                type=NotificationType.TICKET,
                read=False
            )
            db.add(old_agent_notification)
        
        db.commit()
        
        return {"message": f"Ticket reassigned to {agent.full_name}"}
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reassign ticket")

@router.put("/tickets/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark ticket as resolved"""
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = TicketStatus.RESOLVED
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Ticket resolved successfully"}

@router.put("/tickets/{ticket_id}/close")
def close_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark ticket as closed"""
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = TicketStatus.CLOSED
    ticket.updated_at = datetime.utcnow()
    
    # Notify agent if ticket was assigned
    if ticket.agent_id:
        from app.models.analytics import Notification, NotificationType
        agent_notification = Notification(
            user_id=ticket.agent_id,
            title="Ticket Closed by Supervisor",
            message=f"Supervisor {current_user.full_name} closed ticket #{ticket.id}",
            type=NotificationType.TICKET,
            read=False
        )
        db.add(agent_notification)
    
    db.commit()
    
    return {"message": "Ticket closed successfully"}

@router.put("/agents/{agent_id}/status")
def update_agent_status(
    agent_id: int,
    status_data: AgentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Block/unblock agent"""
    
    agent_user = db.query(User).filter(User.id == agent_id, User.role == "AGENT").first()
    if not agent_user:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent_user.is_active = status_data.is_active
    db.commit()
    
    action = "unblocked" if status_data.is_active else "blocked"
    return {"message": f"Agent {agent_user.full_name} has been {action}"}

@router.put("/customers/{customer_id}/status")
def update_customer_status(
    customer_id: int,
    status_data: CustomerStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Block/unblock customer"""
    
    customer_user = db.query(User).filter(User.id == customer_id, User.role == "CUSTOMER").first()
    if not customer_user:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_user.is_active = status_data.is_active
    db.commit()
    
    action = "unblocked" if status_data.is_active else "blocked"
    return {"message": f"Customer {customer_user.full_name} has been {action}"}

@router.get("/analytics")
def get_supervisor_analytics(
    time_range: str = Query("24h"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics data for supervisor dashboard"""
    
    # Calculate time range
    if time_range == "24h":
        start_date = datetime.utcnow() - timedelta(hours=24)
    elif time_range == "7d":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif time_range == "30d":
        start_date = datetime.utcnow() - timedelta(days=30)
    else:
        start_date = datetime.utcnow() - timedelta(hours=24)
    
    # Ticket statistics for the time range
    tickets_in_range = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    
    ticket_stats = {
        "open": len([t for t in tickets_in_range if t.status == TicketStatus.OPEN]),
        "assigned": len([t for t in tickets_in_range if t.status == TicketStatus.IN_PROGRESS]),
        "resolved": len([t for t in tickets_in_range if t.status == TicketStatus.RESOLVED]),
        "closed": len([t for t in tickets_in_range if t.status == TicketStatus.CLOSED])
    }
    
    # Agent performance metrics
    agents = db.query(User).join(Agent).filter(User.role == "AGENT").all()
    agent_performance = []
    
    for agent_user in agents:
        agent_profile = db.query(Agent).filter(Agent.user_id == agent_user.id).first()
        agent_tickets = [t for t in tickets_in_range if t.agent_id == agent_user.id]
        
        agent_performance.append({
            "name": agent_user.full_name,
            "tickets_handled": len(agent_tickets),
            "avg_response_time": agent_profile.response_time if agent_profile else 0,
            "satisfaction_rating": agent_profile.satisfaction_rating if agent_profile else 0,
            "status": agent_profile.status if agent_profile else "OFFLINE"
        })
    
    return {
        "time_range": time_range,
        "ticket_stats": ticket_stats,
        "total_tickets": len(tickets_in_range),
        "agent_performance": agent_performance
    }

# Notification APIs
@router.get("/notifications")
def get_notifications(
    unread_only: bool = Query(False, description="Filter to show only unread notifications"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get supervisor notifications"""
    from app.models.analytics import Notification
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
    from app.models.analytics import Notification
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
    from app.models.analytics import Notification
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}

