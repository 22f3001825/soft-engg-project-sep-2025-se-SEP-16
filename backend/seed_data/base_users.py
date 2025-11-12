"""
Base users seeding module
Creates user accounts for all roles (customers, agents, supervisors, vendors)
"""
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.agent import Agent
from app.models.supervisor import Supervisor
from app.models.vendor import Vendor
from app.core.security import get_password_hash


def seed_base_users(db):
    """Seed base user accounts for all roles"""
    
    users_data = []
    
    # ==================== CUSTOMERS (5) ====================
    customers = [
        {
            "email": "ali.jawad@example.com",
            "full_name": "Ali Jawad",
            "role": UserRole.CUSTOMER,
            "password": "customer123"
        },
        {
            "email": "rachita.vohra@example.com",
            "full_name": "Rachita Vohra",
            "role": UserRole.CUSTOMER,
            "password": "customer123"
        },
        {
            "email": "harsh.mathur@example.com",
            "full_name": "Harsh Mathur",
            "role": UserRole.CUSTOMER,
            "password": "customer123"
        },
        {
            "email": "priya.mehta@example.com",
            "full_name": "Priya Mehta",
            "role": UserRole.CUSTOMER,
            "password": "customer123"
        },
        {
            "email": "aman.verma@example.com",
            "full_name": "Aman Verma",
            "role": UserRole.CUSTOMER,
            "password": "customer123"
        }
    ]
    
    # ==================== AGENTS (3) ====================
    agents = [
        {
            "email": "agent1@company.com",
            "full_name": "Agent One",
            "role": UserRole.AGENT,
            "password": "agent123"
        },
        {
            "email": "agent2@company.com",
            "full_name": "Agent Two",
            "role": UserRole.AGENT,
            "password": "agent123"
        },
        {
            "email": "agent3@company.com",
            "full_name": "Agent Three",
            "role": UserRole.AGENT,
            "password": "agent123"
        }
    ]
    
    # ==================== SUPERVISORS (2) ====================
    supervisors = [
        {
            "email": "supervisor1@company.com",
            "full_name": "Supervisor One",
            "role": UserRole.SUPERVISOR,
            "password": "supervisor123"
        },
        {
            "email": "supervisor2@company.com",
            "full_name": "Supervisor Two",
            "role": UserRole.SUPERVISOR,
            "password": "supervisor123"
        }
    ]
    
    # ==================== VENDORS (3) ====================
    vendors = [
        {
            "email": "cakezone@vendor.com",
            "full_name": "CakeZone Representative",
            "role": UserRole.VENDOR,
            "password": "vendor123"
        },
        {
            "email": "techmart@vendor.com",
            "full_name": "TechMart Representative",
            "role": UserRole.VENDOR,
            "password": "vendor123"
        },
        {
            "email": "greenfresh@vendor.com",
            "full_name": "GreenFresh Representative",
            "role": UserRole.VENDOR,
            "password": "vendor123"
        }
    ]
    
    # Combine all users
    all_users = customers + agents + supervisors + vendors
    
    # Create User objects
    user_objects = []
    for user_data in all_users:
        user = User(
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            password=get_password_hash(user_data["password"])
        )
        user_objects.append(user)
    
    # Add all users to database
    db.add_all(user_objects)
    db.commit()
    
    db.add_all(user_objects)
    db.commit()
    
    # Refresh users to get their IDs
    for user in user_objects:
        db.refresh(user)

    print(f"Seeded {len(user_objects)} base users")
    return user_objects


def seed_customer_profiles(db, customer_users):
    """Create customer profile records linked to customer users"""
    
    customer_profiles = []
    for idx, user in enumerate(customer_users):
        profile = Customer(
            user_id=user.id,
            preferences={"language": "en", "notifications": True, "theme": "light"},
            total_orders=0,
            total_tickets=0
        )
        customer_profiles.append(profile)
    
    db.add_all(customer_profiles)
    db.commit()
    
    print(f"Seeded {len(customer_profiles)} customer profiles")
    return customer_profiles


def seed_agent_profiles(db, agent_users):
    """Create agent profile records linked to agent users"""
    
    departments = ["Customer Support", "Technical Support", "Refunds & Returns"]
    
    agent_profiles = []
    for idx, user in enumerate(agent_users):
        profile = Agent(
            user_id=user.id,
            employee_id=f"EMP{1000 + idx}",
            department=departments[idx % len(departments)],
            response_time=2.5 + (idx * 0.5),  # 2.5, 3.0, 3.5 hours
            tickets_resolved=0
        )
        agent_profiles.append(profile)
    
    db.add_all(agent_profiles)
    db.commit()
    
    print(f"Seeded {len(agent_profiles)} agent profiles")
    return agent_profiles


def seed_supervisor_profiles(db, supervisor_users):
    """Create supervisor profile records linked to supervisor users"""
    
    supervisor_profiles = []
    for idx, user in enumerate(supervisor_users):
        profile = Supervisor(
            user_id=user.id,
            team_size=3 if idx == 0 else 2,
            managed_departments="Customer Support,Technical Support" if idx == 0 else "Refunds & Returns,Escalations",
            escalation_level=2 + idx
        )
        supervisor_profiles.append(profile)
    
    db.add_all(supervisor_profiles)
    db.commit()
    
    print(f"Seeded {len(supervisor_profiles)} supervisor profiles")
    return supervisor_profiles


def seed_vendor_profiles(db, vendor_users):
    """Create vendor profile records linked to vendor users"""
    
    vendor_data = [
        {
            "company_name": "CakeZone Pvt Ltd",
            "business_license": "BL-CAKE-2024-001",
            "product_categories": "Bakery,Desserts,Custom Cakes"
        },
        {
            "company_name": "TechMart Solutions",
            "business_license": "BL-TECH-2024-002",
            "product_categories": "Electronics,Gadgets,Accessories"
        },
        {
            "company_name": "GreenFresh Organics",
            "business_license": "BL-ORGANIC-2024-003",
            "product_categories": "Organic Food,Vegetables,Fruits"
        }
    ]
    
    vendor_profiles = []
    for idx, user in enumerate(vendor_users):
        profile = Vendor(
            user_id=user.id,
            company_name=vendor_data[idx]["company_name"],
            business_license=vendor_data[idx]["business_license"],
            product_categories=vendor_data[idx]["product_categories"],
            total_products=0
        )
        vendor_profiles.append(profile)
    
    db.add_all(vendor_profiles)
    db.commit()
    
    print(f"Seeded {len(vendor_profiles)} vendor profiles")
    return vendor_profiles
