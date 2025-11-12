"""
Notifications and Alerts seeding module
Creates notifications for users and alerts for supervisors
"""
from app.models.analytics import Notification, Alert, NotificationType, AlertType
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.supervisor import Supervisor
from app.models.order import Order
from app.models.ticket import Ticket
from datetime import datetime, timedelta


def seed_notifications(db):
    """Seed notifications for customers and other users"""
    
    # Get all customers
    customers = db.query(Customer).all()
    
    # Get some orders for order notifications
    orders = db.query(Order).all()
    
    # Get some tickets for ticket notifications
    tickets = db.query(Ticket).all()
    
    all_notifications = []
    
    # Create order-related notifications for customers
    for idx, customer in enumerate(customers):
        # Order shipped notification
        if idx < len(orders):
            order = orders[idx]
            notif = Notification(
                user_id=customer.user_id,
                title="Order Update",
                message=f"Your order {order.id} has been shipped and is on its way!",
                type=NotificationType.ORDER,
                read=False,
                timestamp=datetime.utcnow() - timedelta(days=3)
            )
            all_notifications.append(notif)
        
        # Order delivered notification
        if idx + 1 < len(orders):
            order = orders[idx + 1]
            notif = Notification(
                user_id=customer.user_id,
                title="Order Delivered",
                message=f"Your order {order.id} has been successfully delivered. Thank you for shopping with us!",
                type=NotificationType.ORDER,
                read=True,
                timestamp=datetime.utcnow() - timedelta(days=7)
            )
            all_notifications.append(notif)
    
    # Create ticket-related notifications
    for idx, customer in enumerate(customers[:3]):
        if idx < len(tickets):
            ticket = tickets[idx]
            # Ticket update notification
            notif = Notification(
                user_id=customer.user_id,
                title="Ticket Update",
                message=f"Your support ticket {ticket.id} has been updated by our agent.",
                type=NotificationType.TICKET,
                read=False,
                timestamp=datetime.utcnow() - timedelta(hours=12)
            )
            all_notifications.append(notif)
    
    # Create refund notifications
    for idx, customer in enumerate(customers[:2]):
        notif = Notification(
            user_id=customer.user_id,
            title="Refund Processed",
            message="Your refund of ₹899.99 has been processed and will be credited to your account within 5-7 business days.",
            type=NotificationType.REFUND,
            read=False,
            timestamp=datetime.utcnow() - timedelta(days=2)
        )
        all_notifications.append(notif)
    
    # Create system notifications for all users
    all_users = db.query(User).all()
    for user in all_users[:5]:
        notif = Notification(
            user_id=user.id,
            title="System Maintenance",
            message="Scheduled system maintenance will take place on Sunday, 2 AM - 4 AM IST. Services may be temporarily unavailable.",
            type=NotificationType.SYSTEM,
            read=True,
            timestamp=datetime.utcnow() - timedelta(days=5)
        )
        all_notifications.append(notif)
    
    db.add_all(all_notifications)
    db.commit()
    
    print(f"Seeded {len(all_notifications)} notifications")
    return all_notifications


def seed_alerts(db):
    """Seed alerts for supervisors"""
    
    # Get all supervisors
    supervisors = db.query(Supervisor).all()
    
    alerts_data = [
        # Critical alerts
        {
            "type": AlertType.CRITICAL,
            "message": "5 unresolved HIGH-priority tickets detected. Immediate attention required.",
            "severity": 1,
            "resolved": False,
            "days_ago": 1,
            "supervisor_idx": 0
        },
        {
            "type": AlertType.CRITICAL,
            "message": "System performance degradation detected. API response time exceeding 2 seconds.",
            "severity": 1,
            "resolved": True,
            "days_ago": 3,
            "supervisor_idx": 0
        },
        {
            "type": AlertType.CRITICAL,
            "message": "Multiple customer complaints about payment processing failures.",
            "severity": 1,
            "resolved": False,
            "days_ago": 0,
            "supervisor_idx": 1
        },
        # Warning alerts
        {
            "type": AlertType.WARNING,
            "message": "Agent response time exceeding SLA targets by 25%.",
            "severity": 2,
            "resolved": False,
            "days_ago": 2,
            "supervisor_idx": 0
        },
        {
            "type": AlertType.WARNING,
            "message": "Product return rate for 'Wireless Bluetooth Headphones' increased to 5%.",
            "severity": 2,
            "resolved": False,
            "days_ago": 5,
            "supervisor_idx": 1
        },
        {
            "type": AlertType.WARNING,
            "message": "Ticket queue backlog exceeding 20 open tickets.",
            "severity": 2,
            "resolved": True,
            "days_ago": 7,
            "supervisor_idx": 0
        },
        # Info alerts
        {
            "type": AlertType.INFO,
            "message": "New agent onboarding completed successfully.",
            "severity": 3,
            "resolved": True,
            "days_ago": 10,
            "supervisor_idx": 0
        },
        {
            "type": AlertType.INFO,
            "message": "Monthly performance report is now available for review.",
            "severity": 3,
            "resolved": True,
            "days_ago": 15,
            "supervisor_idx": 1
        },
        {
            "type": AlertType.INFO,
            "message": "System backup completed successfully.",
            "severity": 3,
            "resolved": True,
            "days_ago": 1,
            "supervisor_idx": 0
        }
    ]
    
    all_alerts = []
    
    for alert_data in alerts_data:
        if alert_data["supervisor_idx"] < len(supervisors):
            supervisor = supervisors[alert_data["supervisor_idx"]]
            
            alert = Alert(
                type=alert_data["type"],
                message=alert_data["message"],
                timestamp=datetime.utcnow() - timedelta(days=alert_data["days_ago"]),
                severity=alert_data["severity"],
                resolved=alert_data["resolved"],
                supervisor_id=supervisor.user_id
            )
            all_alerts.append(alert)
    
    db.add_all(all_alerts)
    db.commit()
    
    print(f"Seeded {len(all_alerts)} alerts")
    return all_alerts
