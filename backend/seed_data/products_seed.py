"""
Products seeding module
Creates products for vendors with associated complaints and metrics
"""
import uuid
from app.models.product import Product, ProductComplaint, ComplaintStatus
from app.models.analytics import ProductMetrics
from app.models.user import UserRole
from app.models.vendor import Vendor
from datetime import datetime, timedelta


def seed_products(db):
    """Seed products for all vendors"""
    
    # Get all vendors
    vendors = db.query(Vendor).all()
    
    # Products data for each vendor
    vendor_products = [
        # CakeZone Pvt Ltd - Vendor 1
        [
            {
                "name": "Chocolate Truffle Cake",
                "category": "Bakery",
                "price": 899.99,
                "description": "Rich chocolate cake with smooth truffle frosting",
                "return_rate": 0.02
            },
            {
                "name": "Fruit Tart",
                "category": "Desserts",
                "price": 549.99,
                "description": "Fresh seasonal fruits on buttery tart crust",
                "return_rate": 0.01
            },
            {
                "name": "Custom Wedding Cake",
                "category": "Custom Cakes",
                "price": 5999.99,
                "description": "Multi-tier custom designed wedding cake",
                "return_rate": 0.03
            },
            {
                "name": "Chocolate Box Assortment",
                "category": "Desserts",
                "price": 699.99,
                "description": "Premium chocolate assortment gift box",
                "return_rate": 0.01
            }
        ],
        # TechMart Solutions - Vendor 2
        [
            {
                "name": "Wireless Bluetooth Headphones",
                "category": "Electronics",
                "price": 2499.99,
                "description": "Premium noise-canceling wireless headphones",
                "return_rate": 0.05
            },
            {
                "name": "Smartphone Stand",
                "category": "Accessories",
                "price": 299.99,
                "description": "Adjustable aluminum smartphone stand",
                "return_rate": 0.02
            },
            {
                "name": "USB-C Hub 7-in-1",
                "category": "Gadgets",
                "price": 1599.99,
                "description": "Multi-port USB-C hub with HDMI and card readers",
                "return_rate": 0.04
            },
            {
                "name": "Wireless Charging Pad",
                "category": "Accessories",
                "price": 899.99,
                "description": "Fast wireless charging pad for smartphones",
                "return_rate": 0.03
            }
        ],
        # GreenFresh Organics - Vendor 3
        [
            {
                "name": "Organic Mixed Vegetables Box",
                "category": "Vegetables",
                "price": 499.99,
                "description": "Fresh organic seasonal vegetables (5kg)",
                "return_rate": 0.01
            },
            {
                "name": "Fresh Fruit Basket",
                "category": "Fruits",
                "price": 799.99,
                "description": "Premium fresh fruit basket (3kg)",
                "return_rate": 0.02
            },
            {
                "name": "Organic Honey",
                "category": "Organic Food",
                "price": 399.99,
                "description": "Pure organic honey (500g)",
                "return_rate": 0.01
            },
            {
                "name": "Organic Quinoa",
                "category": "Organic Food",
                "price": 349.99,
                "description": "Premium organic quinoa (1kg)",
                "return_rate": 0.01
            }
        ]
    ]
    
    all_products = []
    
    for vendor_idx, vendor in enumerate(vendors):
        products_data = vendor_products[vendor_idx]
        
        for product_data in products_data:
            product = Product(
                id=str(uuid.uuid4()),
                vendor_id=vendor.user_id,
                name=product_data["name"],
                category=product_data["category"],
                price=product_data["price"],
                description=product_data["description"],
                total_complaints=0,
                return_rate=product_data["return_rate"]
            )
            all_products.append(product)
        
        # Update vendor's total_products
        vendor.total_products = len(products_data)
    
    db.add_all(all_products)
    db.commit()
    
    print(f"Seeded {len(all_products)} products across {len(vendors)} vendors")
    return all_products


def seed_product_complaints(db):
    """Seed product complaints from customers"""
    
    # Get products that should have complaints (first 3 products)
    products = db.query(Product).limit(3).all()
    
    # Get some customer IDs
    from app.models.customer import Customer
    customers = db.query(Customer).limit(3).all()
    
    complaints_data = [
        # Complaint for Chocolate Truffle Cake
        {
            "product_idx": 0,
            "customer_idx": 0,
            "issue": "The cake was delivered late and the frosting had melted",
            "severity": "MEDIUM",
            "status": ComplaintStatus.RESOLVED,
            "days_ago": 5
        },
        {
            "product_idx": 0,
            "customer_idx": 1,
            "issue": "Found spoiled cream inside the cake layers",
            "severity": "HIGH",
            "status": ComplaintStatus.IN_PROGRESS,
            "days_ago": 2
        },
        # Complaint for Fruit Tart
        {
            "product_idx": 1,
            "customer_idx": 2,
            "issue": "Packaging was damaged during delivery",
            "severity": "LOW",
            "status": ComplaintStatus.RESOLVED,
            "days_ago": 10
        },
        # Complaint for Custom Wedding Cake
        {
            "product_idx": 2,
            "customer_idx": 0,
            "issue": "Design did not match the agreed specification",
            "severity": "CRITICAL",
            "status": ComplaintStatus.OPEN,
            "days_ago": 1
        }
    ]
    
    all_complaints = []
    
    for complaint_data in complaints_data:
        if complaint_data["product_idx"] < len(products) and complaint_data["customer_idx"] < len(customers):
            product = products[complaint_data["product_idx"]]
            customer = customers[complaint_data["customer_idx"]]
            
            complaint = ProductComplaint(
                product_id=product.id,
                customer_id=customer.user_id,
                issue=complaint_data["issue"],
                severity=complaint_data["severity"],
                status=complaint_data["status"],
                reported_date=datetime.utcnow() - timedelta(days=complaint_data["days_ago"])
            )
            all_complaints.append(complaint)
            
            # Update product's total_complaints
            product.total_complaints += 1
    
    db.add_all(all_complaints)
    db.commit()
    
    print(f"Seeded {len(all_complaints)} product complaints")
    return all_complaints


def seed_product_metrics(db):
    """Seed product metrics for analytics"""
    
    # Get all products
    products = db.query(Product).all()
    
    product_metrics = []
    
    for idx, product in enumerate(products):
        # Generate realistic metrics based on product
        sales_count = 50 + (idx * 15)  # Varying sales counts
        
        # Calculate complaint rate
        if product.total_complaints > 0:
            complaint_rate = round(product.total_complaints / sales_count, 3)
        else:
            complaint_rate = 0.0
        
        metrics = ProductMetrics(
            product_id=product.id,
            sales_count=sales_count,
            complaint_rate=complaint_rate
        )
        product_metrics.append(metrics)
    
    db.add_all(product_metrics)
    db.commit()
    
    print(f"Seeded {len(product_metrics)} product metrics")
    return product_metrics
