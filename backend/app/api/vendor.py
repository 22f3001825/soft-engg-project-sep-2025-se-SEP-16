"""Vendor API endpoints for the Intellica Customer Support System.

This module provides comprehensive vendor-facing API endpoints including:
- Dashboard analytics and product performance metrics
- Product complaint management and analysis
- Vendor profile management
- Notification system
- Settings management

All endpoints include proper authentication, validation, error handling,
and logging for security and maintainability.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import uuid
import os
import shutil
from app.database import get_db
from app.models.user import User, Vendor, UserRole
from app.models.product import Product, ProductComplaint
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, TicketStatus
from app.models.analytics import Notification, NotificationType
from app.services.auth import get_current_user
from app.core.logging import logger
from app.core.validation import sanitize_string, validate_email
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter()

def get_top_issue_category(db: Session, product_ids: List[str]) -> str:
    """
    Analyze ticket data to determine the most common issue category for vendor products.
    
    Args:
        db: Database session
        product_ids: List of product IDs to analyze
        
    Returns:
        str: Most common issue category or "No Issues" if none found
    """
    try:
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
    except Exception as e:
        logger.error(f"Error analyzing issue categories: {str(e)}")
        return "Analysis Error"

class VendorProfileUpdate(BaseModel):
    """Schema for vendor profile update requests."""
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    product_categories: Optional[str] = None

@router.get("/dashboard")
def get_vendor_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve comprehensive dashboard data for the authenticated vendor.
    
    This endpoint provides an overview of the vendor's business including:
    - Key metrics (total complaints, return rate, product count)
    - Top issue categories affecting products
    - Recent complaints with product details
    - Performance analytics
    
    Args:
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Dashboard data including metrics and recent complaints
        
    Raises:
        HTTPException: 403 if user is not a vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Vendor dashboard requested by user ID: {current_user.id}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to access vendor dashboard")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get vendor's products
        vendor_products = db.query(Product).filter(Product.vendor_id == current_user.id).all()
        product_ids = [p.id for p in vendor_products]
        total_products = len(vendor_products)
        
        if product_ids:
            # Get unique order IDs for vendor products
            order_ids_result = db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()
            order_ids = [row[0] for row in order_ids_result] if order_ids_result else []
            
            # Count total order items (not unique orders)
            total_orders = db.query(OrderItem).filter(OrderItem.product_id.in_(product_ids)).count()
            
            if order_ids:
                # Count unique tickets (no duplicates)
                total_complaints = db.query(Ticket).filter(Ticket.related_order_id.in_(order_ids)).count()
            else:
                total_complaints = 0
        else:
            total_orders = 0
            total_complaints = 0
            
        # Calculate return rate (simplified)
        return_rate = round((total_complaints / max(total_orders, 1)) * 100, 1)
        
        # Get recent complaints with product details
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
        
        dashboard_data = {
            "totalComplaints": total_complaints,
            "overallReturnRate": return_rate,
            "topIssueCategory": get_top_issue_category(db, product_ids) if product_ids else "No Issues",
            "totalProducts": total_products,
            "recentComplaints": complaints_data
        }
        
        logger.info(f"Dashboard data successfully retrieved for vendor ID: {current_user.id}")
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error retrieving vendor dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")

@router.get("/analytics")
def get_vendor_analytics(
    date_range: str = Query("30", description="Number of days for analytics range"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve detailed analytics data for vendor's product performance.
    
    This endpoint provides comprehensive analytics including:
    - Complaints trend over time (monthly breakdown)
    - Issue category distribution with percentages
    - Product performance metrics
    - Customer satisfaction insights
    
    Args:
        date_range: Number of days to analyze (default: 30)
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Analytics data with trends and category breakdowns
        
    Raises:
        HTTPException: 400 if date_range is invalid
        HTTPException: 403 if user is not a vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Vendor analytics requested by user ID: {current_user.id}, range: {date_range} days")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to access vendor analytics")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Validate and sanitize date range
        days = int(sanitize_string(date_range, 10))
        if days <= 0 or days > 365:
            raise HTTPException(status_code=400, detail="Date range must be between 1 and 365 days")
        
        start_date = datetime.now() - timedelta(days=days)
        
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
                    categories = {
                        'Delivery Issues': 0,
                        'Quality Issues': 0,
                        'Refund Requests': 0,
                        'Other Issues': 0
                    }
                    
                    for ticket in tickets:
                        subject = ticket.subject.lower()
                        if 'delivery' in subject or 'delay' in subject:
                            categories['Delivery Issues'] += 1
                        elif 'quality' in subject or 'defect' in subject:
                            categories['Quality Issues'] += 1
                        elif 'refund' in subject or 'return' in subject:
                            categories['Refund Requests'] += 1
                        else:
                            categories['Other Issues'] += 1
                    
                    for category, count in categories.items():
                        percentage = round((count / total_tickets) * 100) if total_tickets > 0 else 0
                        issue_categories.append({
                            "category": category,
                            "count": count,
                            "percentage": percentage
                        })
                else:
                    # Return empty categories with 0 values
                    for category in ['Delivery Issues', 'Quality Issues', 'Refund Requests', 'Other Issues']:
                        issue_categories.append({
                            "category": category,
                            "count": 0,
                            "percentage": 0
                        })
        
        # Ensure we always return issue categories even if empty
        if not issue_categories:
            for category in ['Delivery Issues', 'Quality Issues', 'Refund Requests', 'Other Issues']:
                issue_categories.append({
                    "category": category,
                    "count": 0,
                    "percentage": 0
                })
        
        analytics_data = {
            "complaintsTrend": complaints_by_month,
            "issueCategories": issue_categories
        }
        
        logger.info(f"Analytics data successfully retrieved for vendor ID: {current_user.id}")
        return analytics_data
        
    except HTTPException:
        raise
    except ValueError:
        logger.error(f"Invalid date range provided: {date_range}")
        raise HTTPException(status_code=400, detail="Invalid date range format")
    except Exception as e:
        logger.error(f"Error retrieving vendor analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics data")

@router.get("/complaints")
def get_vendor_complaints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve comprehensive complaint analysis for all vendor products.
    
    This endpoint provides detailed complaint analytics including:
    - Product-wise complaint counts and return rates
    - Top issue categories for each product
    - Performance metrics and trends
    - Customer satisfaction insights
    
    Args:
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        List[dict]: List of products with complaint analytics
        
    Raises:
        HTTPException: 403 if user is not a vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Complaints analysis requested by vendor ID: {current_user.id}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to access vendor complaints")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get vendor's products
        vendor_products = db.query(Product).filter(Product.vendor_id == current_user.id).all()
        product_ids = [p.id for p in vendor_products]
        
        complaints_data = []
        
        if product_ids:
            # Get all order IDs for vendor products in one optimized query
            all_order_ids = [row[0] for row in db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().all()]
            
            if all_order_ids:
                # Get all tickets for vendor orders in one query
                all_tickets = db.query(Ticket).filter(Ticket.related_order_id.in_(all_order_ids)).all()
                
                for product in vendor_products:
                    # Get orders for this specific product
                    product_orders = db.query(OrderItem).filter(OrderItem.product_id == product.id).all()
                    product_order_ids = [order.order_id for order in product_orders]
                    
                    # Filter tickets for this product's orders
                    product_tickets = [t for t in all_tickets if t.related_order_id in product_order_ids]
                    
                    # For orders with multiple vendor products, only count tickets once per product
                    # by checking if the ticket subject relates to this specific product
                    relevant_tickets = []
                    for ticket in product_tickets:
                        # Check if ticket is already counted for another product in same order
                        order_items = db.query(OrderItem).filter(OrderItem.order_id == ticket.related_order_id).all()
                        vendor_items_in_order = [item for item in order_items if item.product_id in product_ids]
                        
                        # If order has only one vendor product, count the ticket
                        if len(vendor_items_in_order) == 1 and vendor_items_in_order[0].product_id == product.id:
                            relevant_tickets.append(ticket)
                        # If order has multiple vendor products, distribute tickets evenly
                        elif len(vendor_items_in_order) > 1:
                            # Use ticket ID hash to consistently assign to one product
                            ticket_hash = hash(ticket.id) % len(vendor_items_in_order)
                            assigned_product = vendor_items_in_order[ticket_hash].product_id
                            if assigned_product == product.id:
                                relevant_tickets.append(ticket)
                    
                    complaint_count = len(relevant_tickets)
                    
                    # Calculate return rate
                    total_orders = len(product_orders)
                    return_rate = round((complaint_count / max(total_orders, 1)) * 100, 1)
                    
                    # Analyze issue categories
                    issue_counts = {}
                    for ticket in relevant_tickets:
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
        
        logger.info(f"Complaints analysis completed for vendor ID: {current_user.id}, {len(complaints_data)} products analyzed")
        return complaints_data
        
    except Exception as e:
        logger.error(f"Error retrieving vendor complaints: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve complaints data")
    


@router.get("/profile")
def get_vendor_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve complete vendor profile information.
    
    This endpoint provides comprehensive vendor profile data including:
    - User account information (email, name, avatar)
    - Business details (company name, type, license)
    - Contact information (email, phone, address)
    - Business metrics (product count, rating, verification status)
    
    Args:
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Complete vendor profile with user and business data
        
    Raises:
        HTTPException: 403 if user is not a vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Profile requested by vendor ID: {current_user.id}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to access vendor profile")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        vendor_profile = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        
        profile_data = {
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
        
        logger.info(f"Profile successfully retrieved for vendor ID: {current_user.id}")
        return profile_data
        
    except Exception as e:
        logger.error(f"Error retrieving vendor profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")

@router.post("/profile/avatar")
def upload_vendor_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload vendor profile avatar with validation.
    
    Args:
        file: Avatar image file (multipart/form-data)
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success confirmation with avatar URL
    """
    logger.info(f"Avatar upload requested by vendor ID: {current_user.id}")
    
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="File must have a filename")
        
        allowed_types = ['.png', '.jpg', '.jpeg']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_types:
            raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed. Allowed: {', '.join(allowed_types)}")
        
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 5MB)")
        
        avatar_dir = "uploads/avatars"
        os.makedirs(avatar_dir, exist_ok=True)
        
        filename = f"{current_user.id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(avatar_dir, filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except (OSError, IOError) as e:
            logger.error(f"Failed to save avatar file: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save avatar")
        
        avatar_url = f"/uploads/avatars/{filename}"
        current_user.avatar = avatar_url
        
        db.commit()
        
        logger.info(f"Avatar successfully uploaded for vendor ID: {current_user.id}")
        return {"message": "Avatar uploaded successfully", "avatar_url": avatar_url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading avatar: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload avatar")

@router.put("/profile")
def update_vendor_profile(
    profile_data: VendorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update vendor profile information with validation and sanitization.
    
    This endpoint allows vendors to update their business profile including:
    - Company name and business type
    - Contact information (email, phone)
    - Business address
    - Product categories
    
    Args:
        profile_data: Vendor profile update data
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success message confirming profile update
        
    Raises:
        HTTPException: 400 if validation fails
        HTTPException: 403 if user is not a vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Profile update requested by vendor ID: {current_user.id}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to update vendor profile")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        vendor_profile = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        if not vendor_profile:
            # Create new vendor profile if it doesn't exist
            vendor_profile = Vendor(user_id=current_user.id)
            db.add(vendor_profile)
            logger.info(f"Created new vendor profile for user ID: {current_user.id}")
        
        # Validate and update fields if provided
        if profile_data.company_name is not None:
            company_name = sanitize_string(profile_data.company_name, 200)
            if not company_name:
                raise HTTPException(status_code=400, detail="Company name cannot be empty")
            vendor_profile.company_name = company_name
            
        if profile_data.business_type is not None:
            business_type = sanitize_string(profile_data.business_type, 100)
            vendor_profile.business_type = business_type
            
        if profile_data.contact_email is not None:
            if profile_data.contact_email and not validate_email(profile_data.contact_email):
                raise HTTPException(status_code=400, detail="Invalid email format")
            vendor_profile.contact_email = profile_data.contact_email
            
        if profile_data.contact_phone is not None:
            contact_phone = sanitize_string(profile_data.contact_phone, 20)
            vendor_profile.contact_phone = contact_phone
            
        if profile_data.address is not None:
            address = sanitize_string(profile_data.address, 500)
            vendor_profile.address = address
            
        if profile_data.product_categories is not None:
            product_categories = sanitize_string(profile_data.product_categories, 200)
            vendor_profile.product_categories = product_categories
        
        db.commit()
        db.refresh(vendor_profile)
        
        logger.info(f"Profile successfully updated for vendor ID: {current_user.id}")
        return {"message": "Profile updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating vendor profile: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/settings")
def get_vendor_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve vendor application settings and preferences.
    
    This endpoint provides vendor-specific settings including:
    - Dashboard display preferences
    - Notification settings
    - General application preferences
    
    Note: Settings are primarily stored in frontend localStorage,
    this endpoint returns default values for initialization.
    
    Args:
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Vendor settings with general and notification preferences
        
    Raises:
        HTTPException: 403 if user is not a vendor
    """
    logger.info(f"Settings requested by vendor ID: {current_user.id}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to access vendor settings")
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Return default settings - actual settings stored in localStorage
    settings_data = {
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
    
    logger.info(f"Settings successfully retrieved for vendor ID: {current_user.id}")
    return settings_data

@router.get("/notifications")
def get_vendor_notifications(
    unread_only: bool = Query(False, description="Filter to show only unread notifications"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve vendor notifications with optional filtering.
    
    This endpoint provides access to vendor-specific notifications including:
    - Product complaint alerts
    - Order-related notifications
    - System announcements
    - Performance updates
    
    Args:
        unread_only: If True, returns only unread notifications
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        List[dict]: List of notifications with metadata
        
    Raises:
        HTTPException: 403 if user is not a vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Notifications requested by vendor ID: {current_user.id}, unread_only: {unread_only}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to access vendor notifications")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        query = db.query(Notification).filter(Notification.user_id == current_user.id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
        
        notifications = query.order_by(Notification.timestamp.desc()).limit(50).all()
        
        notification_list = [{
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "read": notif.read,
            "timestamp": notif.timestamp
        } for notif in notifications]
        
        logger.info(f"Retrieved {len(notification_list)} notifications for vendor ID: {current_user.id}")
        return notification_list
        
    except Exception as e:
        logger.error(f"Error retrieving vendor notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve notifications")

@router.delete("/notifications/{notification_id}")
def delete_vendor_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific vendor notification.
    
    This endpoint allows vendors to remove notifications from their inbox.
    Only notifications belonging to the authenticated vendor can be deleted.
    
    Args:
        notification_id: Unique identifier of the notification to delete
        current_user: Authenticated vendor user from JWT token
        db: Database session dependency
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException: 403 if user is not a vendor
        HTTPException: 404 if notification not found or doesn't belong to vendor
        HTTPException: 500 if database operation fails
    """
    logger.info(f"Notification deletion requested by vendor ID: {current_user.id}, notification: {notification_id}")
    
    if current_user.role != UserRole.VENDOR:
        logger.warning(f"Non-vendor user {current_user.id} attempted to delete vendor notification")
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            logger.warning(f"Notification {notification_id} not found for vendor {current_user.id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        db.delete(notification)
        db.commit()
        
        logger.info(f"Notification {notification_id} successfully deleted for vendor ID: {current_user.id}")
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting vendor notification: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete notification")