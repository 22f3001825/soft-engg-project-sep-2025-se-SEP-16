"""
Complete database creation and seeding script
Creates SQLite database and fills it with realistic mock data
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

# Import all models to ensure they're registered
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.agent import Agent
from app.models.supervisor import Supervisor
from app.models.vendor import Vendor
from app.models.product import Product, ProductComplaint, ComplaintStatus
from app.models.order import Order, OrderItem, OrderStatus, TrackingInfo
from app.models.ticket import Ticket, Message, Attachment, TicketStatus, TicketPriority
from app.models.analytics import AgentStats, SupervisorMetrics, ProductMetrics, Notification, Alert, AlertType, NotificationType

# Import seeding functions
from seed_data.base_users import (
    seed_base_users,
    seed_customer_profiles,
    seed_agent_profiles,
    seed_supervisor_profiles,
    seed_vendor_profiles,
)
from seed_data.products_seed import seed_products, seed_product_complaints, seed_product_metrics
from seed_data.orders_seed import seed_orders, seed_tracking_info
from seed_data.tickets_seed import seed_tickets, seed_messages, seed_attachments
from seed_data.notifications_seed import seed_notifications, seed_alerts


def create_and_seed_database():
    """Create SQLite database and seed it with mock data"""
    
    print("Starting database creation and seeding...")
    
    # Create SQLite database
    DATABASE_URL = "sqlite:///./intellica_seeded.db"
    
    # Ensure directory exists
    os.makedirs("./app/instance", exist_ok=True)
    
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Drop and recreate all tables
    print("Dropping existing tables and recreating...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    print("Tables created successfully")
    
    db = SessionLocal()
    try:
        # 1. Insert base users for all roles
        print("\nSeeding Base Users...")
        all_users = seed_base_users(db)
        customer_users = [u for u in all_users if u.role == UserRole.CUSTOMER]
        agent_users = [u for u in all_users if u.role == UserRole.AGENT]
        supervisor_users = [u for u in all_users if u.role == UserRole.SUPERVISOR]
        vendor_users = [u for u in all_users if u.role == UserRole.VENDOR]
        
        # 2. Insert related profiles
        print("\nSeeding User Profiles...")
        seed_customer_profiles(db, customer_users)
        seed_agent_profiles(db, agent_users)
        seed_supervisor_profiles(db, supervisor_users)
        seed_vendor_profiles(db, vendor_users)
        
        # Refresh user objects to get their profiles
        for user in all_users:
            db.refresh(user)
        
        # 3. Insert products
        print("\nSeeding Products...")
        all_products = seed_products(db)
        seed_product_complaints(db)
        seed_product_metrics(db)
        
        # 4. Insert orders
        print("\nSeeding Orders...")
        all_orders, all_order_items = seed_orders(db)
        seed_tracking_info(db)
        
        # 5. Insert tickets
        print("\nSeeding Tickets...")
        all_tickets = seed_tickets(db)
        seed_messages(db)
        seed_attachments(db)
        
        # 6. Insert notifications and alerts
        print("\nSeeding Notifications and Alerts...")
        seed_notifications(db)
        seed_alerts(db)
        
        # 7. Create analytics data
        print("\nCreating Analytics Data...")
        
        # Agent stats
        agent_stats = []
        for agent_user in agent_users:
            stats = AgentStats(
                agent_id=agent_user.id,
                total_tickets=len([t for t in all_tickets if t.agent_id == agent_user.id]),
                avg_response_time=2.5 + (agent_user.id % 3) * 0.5
            )
            agent_stats.append(stats)
        
        db.add_all(agent_stats)
        
        # Supervisor metrics
        supervisor_metrics = []
        for supervisor_user in supervisor_users:
            metrics = SupervisorMetrics(
                supervisor_id=supervisor_user.id,
                team_performance={
                    "team_size": 3 if supervisor_user.id == supervisor_users[0].id else 2,
                    "avg_resolution_time": 3.2,
                    "tickets_closed": 42
                }
            )
            supervisor_metrics.append(metrics)
        
        db.add_all(supervisor_metrics)
        
        db.commit()
        
        # Print summary
        print("\n" + "="*50)
        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*50)
        print(f"Summary:")
        print(f"   Users: {len(all_users)}")
        print(f"   Products: {len(all_products)}")
        print(f"   Orders: {len(all_orders)}")
        print(f"   Tickets: {len(all_tickets)}")
        print(f"   Agent Stats: {len(agent_stats)}")
        print(f"   Supervisor Metrics: {len(supervisor_metrics)}")
        print(f"\nDatabase created: {DATABASE_URL}")
        print("="*50)
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_and_seed_database()