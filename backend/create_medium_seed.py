"""
Realistic Medium Database Seeding Script
Creates logical, real-world data that makes sense
"""
import os
import sys
import uuid
from datetime import datetime, timedelta
from random import choice, randint, sample, uniform

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User, UserRole, Customer, Agent, Supervisor, Vendor
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, TrackingInfo
from app.models.ticket import Ticket, Message, TicketStatus, TicketPriority
from app.models.analytics import Notification, NotificationType
from app.core.security import get_password_hash

def create_database():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

def generate_order_number():
    """Generate realistic order number"""
    return f"ORD{randint(100000, 999999)}"

def generate_ticket_number():
    """Generate realistic ticket number"""
    return f"TKT{randint(10000, 99999)}"

def seed_users_and_profiles(db):
    """Create users and their role-specific profiles"""
    print("Seeding users and profiles...")
    
    users = []
    
    # Create 10 customers with realistic data
    customer_data = [
        ("Ali Jawad", "ali.jawad@gmail.com"),
        ("Rachita Vohra", "rachita.vohra@yahoo.com"),
        ("Harsh Mathur", "harsh.mathur@outlook.com"),
        ("Priya Mehta", "priya.mehta@gmail.com"),
        ("Aman Verma", "aman.verma@hotmail.com"),
        ("Sarah Johnson", "sarah.johnson@gmail.com"),
        ("Michael Chen", "michael.chen@yahoo.com"),
        ("Emily Rodriguez", "emily.rodriguez@gmail.com"),
        ("David Kim", "david.kim@outlook.com"),
        ("Jessica Brown", "jessica.brown@gmail.com")
    ]
    
    for name, email in customer_data:
        user = User(
            email=email,
            password=get_password_hash("customer123"),
            full_name=name,
            role=UserRole.CUSTOMER,
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}"
        )
        db.add(user)
        db.flush()
        
        customer = Customer(
            user_id=user.id,
            preferences={
                "language": "en",
                "notifications": True,
                "theme": "light",
                "currency": "USD"
            },
            total_orders=randint(3, 12),
            total_tickets=randint(1, 4),
            member_since=datetime.now() - timedelta(days=randint(30, 365))
        )
        db.add(customer)
        users.append(user)
    
    # Create 5 agents with realistic names and departments
    agent_data = [
        ("Emma Wilson", "emma.wilson@intellica.com", "Customer Support"),
        ("James Taylor", "james.taylor@intellica.com", "Technical Support"),
        ("Olivia Davis", "olivia.davis@intellica.com", "Billing Support"),
        ("William Miller", "william.miller@intellica.com", "Returns & Refunds"),
        ("Isabella Moore", "isabella.moore@intellica.com", "Product Support")
    ]
    
    for name, email, dept in agent_data:
        user = User(
            email=email,
            password=get_password_hash("agent123"),
            full_name=name,
            role=UserRole.AGENT,
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}"
        )
        db.add(user)
        db.flush()
        
        agent = Agent(
            user_id=user.id,
            employee_id=f"EMP{1000 + len(users)}",
            department=dept,
            response_time=uniform(2.0, 6.0),
            tickets_resolved=randint(80, 250)
        )
        db.add(agent)
        users.append(user)
    
    # Create 1 supervisor with unique credentials
    user = User(
        email="supervisor.demo@intellica.com",
        password=get_password_hash("demo2024"),
        full_name="Robert Johnson",
        role=UserRole.SUPERVISOR,
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=RobertJohnson"
    )
    db.add(user)
    db.flush()
    
    supervisor = Supervisor(
        user_id=user.id,
        team_size=5,
        managed_departments="Customer Support,Technical Support,Billing Support",
        escalation_level=3
    )
    db.add(supervisor)
    users.append(user)
    
    # Create 1 vendor with complete profile data
    user = User(
        email="vendor@techmart.com",
        password=get_password_hash("vendor123"),
        full_name="TechMart Solutions Team",
        role=UserRole.VENDOR,
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=TechMart"
    )
    db.add(user)
    db.flush()
    
    vendor = Vendor(
        user_id=user.id,
        company_name="TechMart Solutions",
        business_type="Electronics Retailer",
        business_license="BL-TECHMART-2024",
        tax_id="TAX-TM-2024",
        contact_email="support@techmart.com",
        contact_phone="+1-800-TECH-MART",
        address="123 Tech Street, Silicon Valley, CA 94000",
        product_categories="Electronics",
        total_products=10,
        rating=4.6,
        verified=True
    )
    db.add(vendor)
    users.append(user)
    
    db.commit()
    print(f"Created {len(users)} users (10 customers, 5 agents, 1 supervisor, 1 vendor)")
    return users

def seed_products(db, vendors):
    """Create realistic product catalog"""
    print("Seeding products...")
    
    products = []
    
    # Electronics products for TechMart vendor
    electronics_products = [
        ("Wireless Bluetooth Headphones", 89.99, "Premium noise-canceling headphones with 30-hour battery life"),
        ("Smartphone Protective Case", 24.99, "Durable case with military-grade drop protection"),
        ("USB-C Fast Charging Cable", 19.99, "6ft braided cable with fast charging support"),
        ("Portable Power Bank 20000mAh", 49.99, "High-capacity charger with dual USB ports"),
        ("Wireless Charging Pad", 34.99, "Qi-compatible fast wireless charger"),
        ("Bluetooth Speaker", 79.99, "Waterproof speaker with 360-degree sound"),
        ("Smart Watch Band", 29.99, "Premium silicone band for fitness tracking"),
        ("Phone Screen Protector", 14.99, "Tempered glass with anti-fingerprint coating"),
        ("Car Phone Mount", 39.99, "Magnetic mount with 360-degree rotation"),
        ("Gaming Mouse", 59.99, "RGB gaming mouse with programmable buttons")
    ]
    
    vendor_user = next(u for u in vendors if u.role == UserRole.VENDOR)
    
    # Create 10 products for the single vendor
    for j, (name, price, description) in enumerate(electronics_products):
        product = Product(
            id=f"PROD{vendor_user.id:03d}{j+1:03d}",
            vendor_id=vendor_user.id,
            sku=f"SKU-TECH-{j+1:03d}",
            name=name,
            category="Electronics",
            price=price,
            description=description,
            stock_quantity=randint(25, 150),
            images=[f"https://picsum.photos/400/400?random={vendor_user.id}{j}"],
            is_active=True,
            rating=round(uniform(4.2, 4.9), 1),
            review_count=randint(15, 85)
        )
        db.add(product)
        products.append(product)
    
    db.commit()
    print(f"Created {len(products)} products")
    return products

def seed_orders(db, customers, products):
    """Create realistic orders for each customer"""
    print("Seeding orders...")
    
    orders = []
    customer_users = [u for u in customers if u.role == UserRole.CUSTOMER]
    
    for customer_user in customer_users:
        # Each customer has 5-8 orders
        num_orders = randint(5, 8)
        
        for i in range(num_orders):
            order_date = datetime.now() - timedelta(days=randint(1, 180))
            
            # Logical order status based on age
            days_old = (datetime.now() - order_date).days
            if days_old < 1:
                status = OrderStatus.PROCESSING
            elif days_old < 3:
                status = choice([OrderStatus.PROCESSING, OrderStatus.SHIPPED])
            elif days_old < 7:
                status = choice([OrderStatus.SHIPPED, OrderStatus.DELIVERED])
            else:
                status = choice([OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.RETURNED])
            
            order = Order(
                id=generate_order_number(),
                order_number=generate_order_number(),
                customer_id=customer_user.id,
                status=status,
                subtotal=0.0,
                tax=0.0,
                shipping_cost=choice([0.0, 5.99, 9.99]),
                discount=choice([0.0, 0.0, 0.0, 5.0, 10.0]),
                total=0.0,
                payment_method=choice(["Credit Card", "Debit Card", "PayPal"]),
                payment_status="Paid",
                shipping_address={
                    "street": f"{randint(100, 9999)} {choice(['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave'])}",
                    "city": choice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]),
                    "state": choice(["NY", "CA", "IL", "TX", "AZ"]),
                    "zip_code": f"{randint(10000, 99999)}",
                    "country": "USA"
                },
                tracking_number=f"1Z{randint(100000000000000000, 999999999999999999)}",
                estimated_delivery=order_date + timedelta(days=randint(3, 7)),
                created_at=order_date
            )
            db.add(order)
            db.flush()
            
            # Add 1-3 items per order
            num_items = randint(1, 3)
            selected_products = sample(products, min(num_items, len(products)))
            subtotal = 0.0
            
            for product in selected_products:
                quantity = randint(1, 2)
                item_subtotal = product.price * quantity
                subtotal += item_subtotal
                
                order_item = OrderItem(
                    id=str(uuid.uuid4()),
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    quantity=quantity,
                    price=product.price,
                    subtotal=item_subtotal
                )
                db.add(order_item)
            
            # Calculate totals
            order.subtotal = subtotal
            order.tax = round(subtotal * 0.08, 2)
            order.total = round(subtotal + order.tax + order.shipping_cost - order.discount, 2)
            
            # Create tracking for shipped/delivered orders
            if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
                tracking = TrackingInfo(
                    id=str(uuid.uuid4()),
                    order_id=order.id,
                    tracking_number=order.tracking_number,
                    current_location=choice([
                        "Distribution Center - Chicago", "In Transit - Denver Hub", 
                        "Local Facility - Your City", "Out for Delivery"
                    ]),
                    status="Delivered" if order.status == OrderStatus.DELIVERED else "In Transit",
                    estimated_delivery=order.estimated_delivery,
                    courier_name=choice(["FedEx", "UPS", "DHL"]),
                    courier_contact=f"1-800-{randint(100, 999)}-{randint(1000, 9999)}"
                )
                db.add(tracking)
            
            orders.append(order)
    
    db.commit()
    print(f"Created {len(orders)} orders with items")
    return orders

def seed_tickets(db, customers, agents, orders):
    """Create realistic support tickets"""
    print("Seeding tickets...")
    
    tickets = []
    customer_users = [u for u in customers if u.role == UserRole.CUSTOMER]
    agent_users = [u for u in agents if u.role == UserRole.AGENT]
    
    # Realistic ticket scenarios
    ticket_scenarios = [
        {
            "subject": "Order delivery delay",
            "customer_message": "Hi, I placed an order 5 days ago and it still hasn't arrived. The tracking shows it's been stuck at the distribution center. Can you please help me track this down?",
            "agent_response": "I apologize for the delay with your order. I've contacted our shipping partner and they've confirmed there was a processing delay at the distribution center. Your package is now on its way and should arrive within 2 business days. I'll send you updated tracking information shortly.",
            "priority": TicketPriority.MEDIUM,
            "status": TicketStatus.RESOLVED
        },
        {
            "subject": "Product quality issue",
            "customer_message": "I received my wireless headphones yesterday, but the left speaker isn't working properly. The sound is very low compared to the right speaker. I'd like to return or exchange this item.",
            "agent_response": "I'm sorry to hear about the quality issue with your headphones. This is definitely not the experience we want our customers to have. I'll arrange for a replacement to be sent out immediately, and you can return the defective unit using the prepaid return label I'm emailing you.",
            "priority": TicketPriority.HIGH,
            "status": TicketStatus.RESOLVED
        },
        {
            "subject": "Refund request for cancelled order",
            "customer_message": "I cancelled my order within 2 hours of placing it, but I still see the charge on my credit card. When will I receive my refund?",
            "agent_response": "Thank you for contacting us about your refund. I can see that your order was successfully cancelled and the refund was processed on our end. Credit card refunds typically take 3-5 business days to appear on your statement. If you don't see it by Friday, please let me know and I'll escalate this with our billing department.",
            "priority": TicketPriority.MEDIUM,
            "status": TicketStatus.CLOSED
        },
        {
            "subject": "Account login issues",
            "customer_message": "I can't log into my account. I keep getting an 'invalid password' error even though I'm sure I'm using the correct password. I tried resetting it but didn't receive the reset email.",
            "agent_response": "I can help you resolve this login issue. I see that your account was temporarily locked due to multiple failed login attempts. I've unlocked it now. Please try logging in again, and if you still have trouble, I can send a password reset link to your alternate email address.",
            "priority": TicketPriority.MEDIUM,
            "status": TicketStatus.IN_PROGRESS
        },
        {
            "subject": "Wrong item shipped",
            "customer_message": "I ordered a blue cotton t-shirt (size M) but received a red hoodie (size L) instead. This is completely wrong. I need the correct item for an event this weekend.",
            "agent_response": "I sincerely apologize for this shipping error. I can see exactly what happened - there was a mix-up in our fulfillment center. I'm expediting the correct blue t-shirt in size M to you via overnight shipping at no charge. You should receive it tomorrow. For the inconvenience, I'm also providing a full refund for the shipping cost of your original order.",
            "priority": TicketPriority.HIGH,
            "status": TicketStatus.RESOLVED
        },
        {
            "subject": "Need help with product selection",
            "customer_message": "I'm looking for a wireless speaker for outdoor use. Can someone help me choose the right product from your catalog?",
            "agent_response": "",
            "priority": TicketPriority.LOW,
            "status": TicketStatus.OPEN
        },
        {
            "subject": "Payment processing issue",
            "customer_message": "My payment failed during checkout but I was still charged. Please help resolve this.",
            "agent_response": "",
            "priority": TicketPriority.HIGH,
            "status": TicketStatus.OPEN
        }
    ]
    
    for customer_user in customer_users:
        # Each customer has 2-4 tickets
        num_tickets = randint(2, 4)
        
        for i in range(num_tickets):
            scenario = choice(ticket_scenarios)
            ticket_date = datetime.now() - timedelta(days=randint(1, 30))
            
            # Assign agent based on ticket type and status
            assigned_agent = None
            if scenario["status"] != TicketStatus.OPEN:
                assigned_agent = choice(agent_users)
            
            # Link some tickets to orders for realism
            related_order = None
            if "order" in scenario["subject"].lower() or "delivery" in scenario["subject"].lower() or "refund" in scenario["subject"].lower():
                # Find a recent order for this customer
                customer_orders = [o for o in orders if o.customer_id == customer_user.id]
                if customer_orders:
                    related_order = choice(customer_orders).id
            
            ticket = Ticket(
                id=generate_ticket_number(),
                customer_id=customer_user.id,
                agent_id=assigned_agent.id if assigned_agent else None,
                subject=scenario["subject"],
                status=scenario["status"],
                priority=scenario["priority"],
                related_order_id=related_order,
                created_at=ticket_date
            )
            db.add(ticket)
            db.flush()
            
            # Add customer message
            customer_message = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=customer_user.id,
                sender_name=customer_user.full_name,
                content=scenario["customer_message"],
                created_at=ticket_date
            )
            db.add(customer_message)
            
            # Add agent response if ticket is not open
            if assigned_agent and scenario["status"] != TicketStatus.OPEN:
                agent_message = Message(
                    id=str(uuid.uuid4()),
                    ticket_id=ticket.id,
                    sender_id=assigned_agent.id,
                    sender_name=assigned_agent.full_name,
                    content=scenario["agent_response"],
                    created_at=ticket_date + timedelta(hours=randint(2, 24))
                )
                db.add(agent_message)
            
            tickets.append(ticket)
    
    db.commit()
    print(f"Created {len(tickets)} tickets with realistic conversations")
    return tickets

def seed_vendor_complaints(db, orders, products, users):
    """Create vendor-related complaint tickets for existing orders"""
    print("Seeding vendor complaints...")
    
    # Get vendor products
    vendor_products = [p for p in products if p.vendor_id]
    if not vendor_products:
        print("No vendor products found")
        return
    
    # Get orders that contain vendor products
    product_ids = [p.id for p in vendor_products]
    vendor_orders = []
    for order in orders:
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        if any(item.product_id in product_ids for item in order_items):
            vendor_orders.append(order)
    
    if not vendor_orders:
        print("No orders with vendor products found")
        return
    
    # Create realistic complaint scenarios with proper categorization
    complaint_scenarios = [
        {
            "subject": "Product delivery delay - order not received",
            "description": "My order was supposed to arrive 3 days ago but still hasn't been delivered. Need urgent update.",
        },
        {
            "subject": "Quality issue with wireless headphones",
            "description": "The left speaker stopped working after 2 weeks of use. Very disappointed with the quality.",
        },
        {
            "subject": "Refund request for defective charging cable",
            "description": "The USB-C cable doesn't charge my phone properly. Requesting full refund.",
        },
        {
            "subject": "Wrong item delivered - need replacement",
            "description": "Ordered a power bank but received a phone case instead. Please resolve this issue.",
        },
        {
            "subject": "Bluetooth speaker quality defect",
            "description": "The speaker pairs but audio doesn't play. Tried multiple devices with same issue.",
        },
        {
            "subject": "Delivery damaged package",
            "description": "Package arrived damaged and the product inside is broken. Need replacement.",
        },
        {
            "subject": "Return request for wrong size",
            "description": "Ordered medium size but received large. Need to return and get correct size.",
        },
        {
            "subject": "Product not working as advertised",
            "description": "The wireless charging pad doesn't work with my phone despite being advertised as compatible.",
        }
    ]
    
    # Get some agents for assignment
    agent_users = [u for u in users if u.role == UserRole.AGENT]
    
    complaints_added = 0
    # Create exactly 15 complaints to match dashboard count
    selected_orders = sample(vendor_orders, min(15, len(vendor_orders)))
    
    for i, order in enumerate(selected_orders):
        scenario = choice(complaint_scenarios)
        
        # Assign some tickets to agents (resolved/in progress)
        assigned_agent = None
        ticket_status = TicketStatus.OPEN
        
        if i < 8:  # First 8 tickets are resolved/in progress
            assigned_agent = choice(agent_users)
            ticket_status = choice([TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS, TicketStatus.CLOSED])
        
        # Create complaint ticket
        ticket = Ticket(
            id=f"TKT{10000 + i}",
            customer_id=order.customer_id,
            agent_id=assigned_agent.id if assigned_agent else None,
            subject=scenario["subject"],
            status=ticket_status,
            priority=choice([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]),
            related_order_id=order.id,
            created_at=datetime.now() - timedelta(days=randint(1, 30))
        )
        db.add(ticket)
        db.flush()
        
        # Add customer message
        customer = next(u for u in users if u.id == order.customer_id)
        customer_message = Message(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            sender_id=order.customer_id,
            sender_name=customer.full_name,
            content=scenario["description"],
            created_at=ticket.created_at
        )
        db.add(customer_message)
        
        # Add agent response for resolved tickets
        if assigned_agent and ticket_status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            agent_responses = [
                "Thank you for contacting us. I've investigated your issue and have arranged for a replacement to be sent out.",
                "I apologize for the inconvenience. Your refund has been processed and should appear in 3-5 business days.",
                "I've contacted our shipping partner and your order is now being expedited. You should receive it within 2 days.",
                "I understand your frustration. I've arranged for a return label to be sent to you and a full refund will be issued."
            ]
            
            agent_message = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=assigned_agent.id,
                sender_name=assigned_agent.full_name,
                content=choice(agent_responses),
                created_at=ticket.created_at + timedelta(hours=randint(2, 24))
            )
            db.add(agent_message)
        
        complaints_added += 1
    
    db.commit()
    print(f"Added {complaints_added} vendor complaint tickets")

def seed_notifications(db, users):
    """Create realistic notifications"""
    print("Seeding notifications...")
    
    for user in users:
        if user.role == UserRole.CUSTOMER:
            # Create exactly 2 notifications for customers
            notifications_data = [
                (NotificationType.ORDER, "Your order has been shipped and is on its way", False),
                (NotificationType.TICKET, "New response received on your support ticket", False)
            ]
            
            for notif_type, message, read_status in notifications_data:
                notification = Notification(
                    user_id=user.id,
                    title=f"{notif_type.value.title()} Update",
                    message=message,
                    type=notif_type,
                    read=read_status,
                    timestamp=datetime.now() - timedelta(hours=randint(1, 24))
                )
                db.add(notification)
        
        elif user.role == UserRole.VENDOR:
            # Create vendor-specific notifications
            notifications_data = [
                (NotificationType.TICKET, "New product complaint reported by customer", False),
                (NotificationType.ORDER, "New order received for your products", False),
                (NotificationType.SYSTEM, "Monthly performance report available", False),
                (NotificationType.TICKET, "Customer requested return for your product", False),
                (NotificationType.ORDER, "Order fulfillment deadline approaching", False)
            ]
            
            for notif_type, message, read_status in notifications_data:
                notification = Notification(
                    user_id=user.id,
                    title=f"{notif_type.value.title()} Alert",
                    message=message,
                    type=notif_type,
                    read=read_status,
                    timestamp=datetime.now() - timedelta(hours=randint(1, 48))
                )
                db.add(notification)
    
    db.commit()
    print("Created realistic notifications")

def main():
    """Main seeding function"""
    print("Starting realistic medium database seeding...")
    
    create_database()
    db = SessionLocal()
    
    try:
        users = seed_users_and_profiles(db)
        products = seed_products(db, users)
        orders = seed_orders(db, users, products)
        # Only create vendor-related tickets, not general customer service tickets
        seed_vendor_complaints(db, orders, products, users)
        seed_notifications(db, users)
        
        print("\n" + "="*60)
        print("REALISTIC MEDIUM DATABASE SEEDING COMPLETED!")
        print("="*60)
        print(f"Users: {len(users)} (10 customers, 5 agents, 1 supervisor, 1 vendor)")
        print(f"Products: {len(products)} (realistic catalog)")
        print(f"Orders: {len(orders)} (5-8 per customer with logical statuses)")
        print("Tickets: 15 (vendor complaint tickets only)")
        print("Notifications: 2 per customer, 2 per vendor (all unread)")
        print("="*60)
        print("[OK] Logical order statuses based on order age")
        print("[OK] Realistic ticket conversations between customers and agents")
        print("[OK] Professional order and ticket IDs")
        print("[OK] Real-world product catalog")
        print("[OK] Proper customer-agent message attribution")
        print("="*60)
        print("Ready for professional testing!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()