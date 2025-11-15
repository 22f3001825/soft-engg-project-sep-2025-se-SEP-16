from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.user import User, Vendor, UserRole
from app.models.product import Product, ProductComplaint
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, TicketStatus
from app.models.analytics import Notification, NotificationType
from app.services.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter()

def get_top_issue_category(db: Session, product_ids: List[str]) -> str:
    """Get the most common issue category from real ticket data"""
    if not product_ids:
        return "No Issues"
    
    order_ids = [row[0] for row in db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()]
    if not order_ids:
        return "No Issues"
    
    tickets = db.query(Ticket).filter(Ticket.related_order_id.in_(order_ids)).all()
    if not tickets:
        return "No Issues"
    
    categories = {}
    for ticket in tickets:
        subject = ticket.subject.lower()
        if 'delivery' in subject or 'delay' in subject:
            categories['Delivery Issues'] = categories.get('Delivery Issues', 0) + 1
        elif 'quality' in subject or 'defect' in subject:
            categories['Quality Issues'] = categories.get('Quality Issues', 0) + 1
        elif 'refund' in subject or 'return' in subject:
            categories['Refund Requests'] = categories.get('Refund Requests', 0) + 1
        else:
            categories['Other Issues'] = categories.get('Other Issues', 0) + 1
    
    return max(categories.keys(), key=lambda x: categories[x]) if categories else "No Issues"

class VendorProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    product_categories: Optional[str] = None

@router.get("/dashboard")
def get_vendor_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get vendor dashboard overview with key metrics"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get vendor's products
    vendor_products = db.query(Product).filter(Product.vendor_id == current_user.id).all()
    product_ids = [p.id for p in vendor_products]
    
    # Calculate metrics
    total_products = len(vendor_products)
    
    try:
        if product_ids:
            # Simple count queries
            total_orders = db.query(OrderItem).filter(OrderItem.product_id.in_(product_ids)).count()
            
            # Get order IDs safely
            order_ids_result = db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()
            order_ids = [row[0] for row in order_ids_result] if order_ids_result else []
            
            if order_ids:
                total_complaints = db.query(Ticket).filter(Ticket.related_order_id.in_(order_ids)).count()
            else:
                total_complaints = 0
        else:
            total_orders = 0
            total_complaints = 0
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")
    
    # Calculate return rate (simplified)
    return_rate = round((total_complaints / max(total_orders, 1)) * 100, 1)
    
    # Get real recent complaints with optimized query
    complaints_data = []
    if product_ids:
        order_ids = [row[0] for row in db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()]
        
        if order_ids:
            recent_tickets = db.query(Ticket).filter(
                Ticket.related_order_id.in_(order_ids)
            ).order_by(desc(Ticket.created_at)).limit(5).all()
            
            for ticket in recent_tickets:
                # Get product name from order items
                order_item = db.query(OrderItem).filter(
                    OrderItem.order_id == ticket.related_order_id,
                    OrderItem.product_id.in_(product_ids)
                ).first()
                
                complaints_data.append({
                    "id": ticket.id,
                    "productName": order_item.product_name if order_item else "Unknown Product",
                    "issue": ticket.subject,
                    "severity": "high" if ticket.priority == "HIGH" else "medium" if ticket.priority == "MEDIUM" else "low",
                    "status": ticket.status.lower().replace("_", "-"),
                    "reportedDate": ticket.created_at.isoformat()
                })
    
    return {
        "totalComplaints": total_complaints,
        "overallReturnRate": return_rate,
        "topIssueCategory": get_top_issue_category(db, product_ids) if product_ids else "No Issues",
        "totalProducts": total_products,
        "recentComplaints": complaints_data
    }

@router.get("/analytics")
def get_vendor_analytics(date_range: str = "30", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get detailed analytics for vendor's products"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Calculate date range
        days = int(date_range)
        start_date = datetime.now() - timedelta(days=days)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date range")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics data")
    
    # Get vendor's products for filtering
    vendor_products = db.query(Product).filter(Product.vendor_id == current_user.id).all()
    product_ids = [p.id for p in vendor_products]
    
    complaints_by_month = []
    if product_ids:
        order_ids = [row[0] for row in db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()]
        
        if order_ids:
            # Get last 6 months of real data
            for i in range(6):
                month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
                month_end = month_start + timedelta(days=30)
                count = db.query(Ticket).filter(
                    Ticket.related_order_id.in_(order_ids),
                    Ticket.created_at >= month_start,
                    Ticket.created_at < month_end
                ).count()
                complaints_by_month.append({
                    "month": month_start.strftime("%b"),
                    "complaints": count
                })
    
    # Get real issue categories from ticket subjects
    issue_categories = []
    if product_ids:
        order_ids = [row[0] for row in db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()]
        if order_ids:
            tickets = db.query(Ticket).filter(Ticket.related_order_id.in_(order_ids)).all()
            total_tickets = len(tickets)
            
            if total_tickets > 0:
                # Count categories based on ticket subjects
                categories = {}
                for ticket in tickets:
                    subject = ticket.subject.lower()
                    if 'delivery' in subject or 'delay' in subject:
                        categories['Delivery Issues'] = categories.get('Delivery Issues', 0) + 1
                    elif 'quality' in subject or 'defect' in subject:
                        categories['Quality Issues'] = categories.get('Quality Issues', 0) + 1
                    elif 'refund' in subject or 'return' in subject:
                        categories['Refund Requests'] = categories.get('Refund Requests', 0) + 1
                    else:
                        categories['Other Issues'] = categories.get('Other Issues', 0) + 1
                
                for category, count in categories.items():
                    percentage = round((count / total_tickets) * 100)
                    issue_categories.append({
                        "category": category,
                        "count": count,
                        "percentage": percentage
                    })
    
    return {
        "complaintsTrend": complaints_by_month,
        "issueCategories": issue_categories
    }

@router.get("/complaints")
def get_vendor_complaints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all complaints for vendor's products"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get vendor's products
    vendor_products = db.query(Product).filter(Product.vendor_id == current_user.id).all()
    product_ids = [p.id for p in vendor_products]
    
    complaints_data = []
    
    if product_ids:
        # Get all order IDs for vendor products in one query
        all_order_ids = [row[0] for row in db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()]
        
        if all_order_ids:
            # Get all tickets for vendor orders in one query
            all_tickets = db.query(Ticket).filter(Ticket.related_order_id.in_(all_order_ids)).all()
            
            for product in vendor_products:
                # Get orders for this specific product
                product_orders = db.query(OrderItem).filter(OrderItem.product_id == product.id).all()
                product_order_ids = [order.order_id for order in product_orders]
                
                # Filter tickets for this product
                product_tickets = [t for t in all_tickets if t.related_order_id in product_order_ids]
                complaint_count = len(product_tickets)
                
                # Calculate return rate
                total_orders = len(product_orders)
                return_rate = round((complaint_count / max(total_orders, 1)) * 100, 1)
                
                # Get top issues
                issue_counts = {}
                for ticket in product_tickets:
                    subject = ticket.subject.lower()
                    if 'delivery' in subject:
                        issue_counts['Delivery'] = issue_counts.get('Delivery', 0) + 1
                    elif 'quality' in subject:
                        issue_counts['Quality'] = issue_counts.get('Quality', 0) + 1
                    elif 'refund' in subject:
                        issue_counts['Refund'] = issue_counts.get('Refund', 0) + 1
                    else:
                        issue_counts['Other'] = issue_counts.get('Other', 0) + 1
                
                top_issues = sorted(issue_counts.keys(), key=lambda x: issue_counts[x], reverse=True)[:3] if issue_counts else ["No Issues"]
                
                complaints_data.append({
                    "id": product.id,
                    "name": product.name,
                    "category": product.category,
                    "totalComplaints": complaint_count,
                    "returnRate": return_rate,
                    "topIssues": top_issues
                })
    
    return complaints_data
    


@router.get("/profile")
def get_vendor_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get vendor profile information"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    vendor_profile = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "avatar": current_user.avatar
        },
        "vendor": {
            "company_name": vendor_profile.company_name if vendor_profile else None,
            "business_type": vendor_profile.business_type if vendor_profile else None,
            "business_license": vendor_profile.business_license if vendor_profile else None,
            "tax_id": vendor_profile.tax_id if vendor_profile else None,
            "contact_email": vendor_profile.contact_email if vendor_profile else None,
            "contact_phone": vendor_profile.contact_phone if vendor_profile else None,
            "address": vendor_profile.address if vendor_profile else None,
            "product_categories": vendor_profile.product_categories if vendor_profile else None,
            "total_products": vendor_profile.total_products if vendor_profile else 0,
            "rating": vendor_profile.rating if vendor_profile else 0.0,
            "verified": vendor_profile.verified if vendor_profile else False
        }
    }

@router.put("/profile")
def update_vendor_profile(profile_data: VendorProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update vendor profile information"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    vendor_profile = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor_profile:
        # Create new vendor profile if it doesn't exist
        vendor_profile = Vendor(user_id=current_user.id)
        db.add(vendor_profile)
    
    # Update fields if provided
    if profile_data.company_name is not None:
        vendor_profile.company_name = profile_data.company_name
    if profile_data.business_type is not None:
        vendor_profile.business_type = profile_data.business_type
    if profile_data.contact_email is not None:
        vendor_profile.contact_email = profile_data.contact_email
    if profile_data.contact_phone is not None:
        vendor_profile.contact_phone = profile_data.contact_phone
    if profile_data.address is not None:
        vendor_profile.address = profile_data.address
    if profile_data.product_categories is not None:
        vendor_profile.product_categories = profile_data.product_categories
    
    db.commit()
    db.refresh(vendor_profile)
    
    return {"message": "Profile updated successfully"}

@router.get("/settings")
def get_vendor_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get vendor settings (stored in localStorage on frontend)"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Return default settings - actual settings stored in localStorage
    return {
        "general": {
            "dashboardRange": "30",
            "timezone": "UTC-5",
            "theme": "light"
        },
        "notifications": {
            "newComplaints": True,
            "resolvedComplaints": True
        }
    }

@router.get("/notifications")
def get_vendor_notifications(
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vendor notifications"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
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

@router.delete("/notifications/{notification_id}")
def delete_vendor_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete vendor notification"""
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}