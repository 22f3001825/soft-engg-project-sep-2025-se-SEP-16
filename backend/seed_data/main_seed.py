"""
Main seeding script
Orchestrates the seeding process for all modules.
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine, SessionLocal
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.analytics import Notification, Alert

from seed_data.base_users import (
    seed_base_users,
    seed_customer_profiles,
    seed_agent_profiles,
    seed_supervisor_profiles,
    seed_vendor_profiles,
)
from seed_data.customers_seed import seed_customer_portal_data
from seed_data.agents_seed import seed_agent_portal_data
from seed_data.supervisors_seed import seed_supervisor_portal_data
from seed_data.vendors_seed import seed_vendor_portal_data
from seed_data.products_seed import seed_products, seed_product_complaints, seed_product_metrics
from seed_data.orders_seed import seed_orders, seed_tracking_info
from seed_data.tickets_seed import seed_tickets, seed_messages, seed_attachments
from seed_data.notifications_seed import seed_notifications, seed_alerts


def main_seed():
    print("Starting database seeding...")
    
    # Use the configured database from settings
    from app.core.config import settings
    print(f"Using database: {settings.database_url}")

    # Drop and recreate all tables
    print("Dropping existing tables and recreating...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    print("Tables recreated successfully.")

    db = SessionLocal()
    try:
        # 1. Insert base users for all roles
        print("\n--- Seeding Base Users ---")
        all_users = seed_base_users(db)
        customer_users = [u for u in all_users if u.role == UserRole.CUSTOMER]
        agent_users = [u for u in all_users if u.role == UserRole.AGENT]
        supervisor_users = [u for u in all_users if u.role == UserRole.SUPERVISOR]
        vendor_users = [u for u in all_users if u.role == UserRole.VENDOR]

        # 2. Insert related profiles (customers, agents, supervisors, vendors)
        print("\n--- Seeding User Profiles ---")
        seed_customer_profiles(db, customer_users)
        seed_agent_profiles(db, agent_users)
        seed_supervisor_profiles(db, supervisor_users)
        seed_vendor_profiles(db, vendor_users)
        
        # Refresh user objects to get their profiles
        for user in all_users:
            db.refresh(user)

        # 3. Insert products (linked to vendors)
        print("\n--- Seeding Products ---")
        all_products = seed_products(db)
        seed_product_complaints(db)
        seed_product_metrics(db)

        # 4. Insert orders + order_items + tracking_info (linked to customers/products)
        print("\n--- Seeding Orders ---")
        all_orders, all_order_items = seed_orders(db)
        seed_tracking_info(db)

        # 5. Insert tickets + messages (linked to customers/agents)
        print("\n--- Seeding Tickets ---")
        all_tickets = seed_tickets(db)
        seed_messages(db)
        seed_attachments(db)

        # 6. Insert agent stats
        print("\n--- Seeding Agent Portal Data ---")
        all_agent_stats = seed_agent_portal_data(db, agent_users, customer_users, all_tickets)

        # 7. Insert analytics + metrics + notifications + alerts
        print("\n--- Seeding Supervisor Portal Data ---")
        all_supervisor_metrics, all_alerts = seed_supervisor_portal_data(db, supervisor_users, agent_users)
        
        # 8. Insert notifications and alerts
        print("\n--- Seeding Notifications and Alerts ---")
        seed_notifications(db)
        seed_alerts(db)

        db.commit()
        print("\nDatabase seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"An error occurred during seeding: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main_seed()
