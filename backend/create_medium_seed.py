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
    
    # Create 1 supervisor
    user = User(
        email="supervisor@intellica.com",
        password=get_password_hash("supervisor123"),
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
    
    # Create 4 vendors with realistic companies
    vendor_data = [
        ("TechMart Solutions", "vendor@techmart.com", "Electronics"),
        ("CakeZone Bakery", "orders@cakezone.com", "Food & Beverages"),
        ("StyleHub Fashion", "sales@stylehub.com", "Fashion & Clothing"),
        ("HomeComfort Furniture", "support@homecomfort.com", "Home & Garden")
    ]
    
    for company, email, category in vendor_data:
        user = User(
            email=email,
            password=get_password_hash("vendor123"),
            full_name=f"{company} Team",
            role=UserRole.VENDOR,
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={company.replace(' ', '')}"
        )
        db.add(user)
        db.flush()
        
        vendor = Vendor(
            user_id=user.id,
            company_name=company,
            business_license=f"BL-{company.upper().replace(' ', '')}-2024",
            product_categories=category,
            total_products=randint(8, 15)
        )
        db.add(vendor)
        users.append(user)
    
    db.commit()
    print(f"Created {len(users)} users (10 customers, 5 agents, 1 supervisor, 4 vendors)")
    return users

def seed_products(db, vendors):
    """Create realistic product catalog"""
    print("Seeding products...")
    
    products = []
    
    # Realistic product data by category
    product_data = {
        "Electronics": [
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
        ],
        "Food & Beverages": [
            ("Chocolate Truffle Cake", 45.99, "Rich chocolate cake with Belgian truffle filling"),
            ("Organic Wildflower Honey", 28.99, "Pure honey from local organic farms"),
            ("Artisan Coffee Beans", 32.99, "Single-origin beans, medium roast, 1lb bag"),
            ("Handmade Pasta Collection", 22.99, "Authentic Italian pasta with traditional recipes"),
            ("Extra Virgin Olive Oil", 38.99, "Cold-pressed oil from Mediterranean olives"),
            ("Gourmet Tea Sampler", 24.99, "Collection of premium loose-leaf teas"),
            ("Artisan Bread Loaf", 12.99, "Fresh-baked sourdough bread"),
            ("Organic Fruit Preserves", 18.99, "Small-batch jams made with organic fruits"),
            ("Premium Spice Set", 42.99, "Collection of exotic spices from around the world"),
            ("Craft Beer Selection", 35.99, "Curated selection of local craft beers")
        ],
        "Fashion & Clothing": [
            ("Cotton Casual T-Shirt", 19.99, "100% organic cotton tee in multiple colors"),
            ("Premium Denim Jeans", 89.99, "Classic fit jeans with stretch comfort"),
            ("Leather Wallet", 79.99, "Genuine leather with RFID blocking technology"),
            ("Running Sneakers", 129.99, "Lightweight athletic shoes with cushioned sole"),
            ("Wool Winter Scarf", 34.99, "Soft merino wool scarf for cold weather"),
            ("Designer Sunglasses", 149.99, "UV protection with polarized lenses"),
            ("Casual Button Shirt", 49.99, "Wrinkle-resistant shirt for everyday wear"),
            ("Leather Belt", 59.99, "Genuine leather belt with classic buckle"),
            ("Sports Cap", 24.99, "Adjustable cap with moisture-wicking fabric"),
            ("Cozy Hoodie", 69.99, "Soft fleece hoodie with kangaroo pocket")
        ],
        "Home & Garden": [
            ("Ceramic Coffee Mug Set", 29.99, "Set of 4 handcrafted ceramic mugs"),
            ("Bamboo Cutting Board", 39.99, "Eco-friendly board with juice groove"),
            ("LED Desk Lamp", 54.99, "Adjustable lamp with USB charging port"),
            ("Decorative Throw Pillow", 16.99, "Soft pillow with modern geometric pattern"),
            ("Essential Oil Diffuser", 44.99, "Ultrasonic diffuser with color-changing lights"),
            ("Indoor Plant Pot", 19.99, "Ceramic pot with drainage tray"),
            ("Kitchen Knife Set", 89.99, "Professional-grade stainless steel knives"),
            ("Cozy Throw Blanket", 49.99, "Soft fleece blanket for living room"),
            ("Wall Art Print", 34.99, "Modern abstract art for home decoration"),
            ("Scented Candle Set", 39.99, "Set of 3 soy candles with relaxing scents")
        ]
    }
    
    vendor_users = [u for u in vendors if u.role == UserRole.VENDOR]
    categories = list(product_data.keys())
    
    for i, vendor_user in enumerate(vendor_users):
        category = categories[i]
        category_products = product_data[category]
        
        # Each vendor gets 10 products
        for j, (name, price, description) in enumerate(category_products):
            product = Product(
                id=f"PROD{vendor_user.id:03d}{j+1:03d}",
                vendor_id=vendor_user.id,
                sku=f"SKU-{category[:3].upper()}-{j+1:03d}",
                name=name,
                category=category,
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

def seed_notifications(db, users):
    """Create realistic notifications"""
    print("Seeding notifications...")
    
    notification_templates = {
        NotificationType.ORDER: [
            "Your order has been confirmed and is being processed",
            "Your order has been shipped and is on its way",
            "Your order has been delivered successfully",
            "Your return request has been approved"
        ],
        NotificationType.TICKET: [
            "Your support ticket has been assigned to an agent",
            "New response received on your support ticket",
            "Your support ticket has been resolved",
            "Your support ticket has been closed"
        ],
        NotificationType.SYSTEM: [
            "Welcome to our platform! Explore our latest products",
            "Your account security settings have been updated",
            "New features are now available in your dashboard",
            "Scheduled maintenance completed successfully"
        ]
    }
    
    for user in users:
        if user.role == UserRole.CUSTOMER:
            num_notifications = randint(4, 8)
            for i in range(num_notifications):
                notif_type = choice(list(notification_templates.keys()))
                message = choice(notification_templates[notif_type])
                
                notification = Notification(
                    user_id=user.id,
                    title=f"{notif_type.value.title()} Update",
                    message=message,
                    type=notif_type,
                    read=choice([True, True, False]),  # 66% read
                    timestamp=datetime.now() - timedelta(days=randint(1, 15))
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
        tickets = seed_tickets(db, users, users, orders)
        seed_notifications(db, users)
        
        print("\n" + "="*60)
        print("REALISTIC MEDIUM DATABASE SEEDING COMPLETED!")
        print("="*60)
        print(f"Users: {len(users)} (10 customers, 5 agents, 1 supervisor, 4 vendors)")
        print(f"Products: {len(products)} (realistic catalog)")
        print(f"Orders: {len(orders)} (5-8 per customer with logical statuses)")
        print(f"Tickets: {len(tickets)} (realistic support conversations)")
        print("="*60)
        print("[✓] Logical order statuses based on order age")
        print("[✓] Realistic ticket conversations between customers and agents")
        print("[✓] Professional order and ticket IDs")
        print("[✓] Real-world product catalog")
        print("[✓] Proper customer-agent message attribution")
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