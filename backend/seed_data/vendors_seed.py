"""
Vendor portal data seeding module
Creates vendor-specific data like products, product complaints, and product metrics.
"""
import json
from datetime import datetime, timedelta
from random import choice, randint, uniform

from app.models.product import Product, ProductComplaint, ComplaintStatus
from app.models.analytics import ProductMetrics
from app.models.user import User, UserRole
from app.models.vendor import Vendor
from app.models.customer import Customer


def seed_vendor_portal_data(db, vendor_users, customer_users):
    """Seed vendor-specific data: products, product complaints, and product metrics."""

    all_products = []
    all_product_complaints = []
    all_product_metrics = []

    product_names = {
        "CakeZone Pvt Ltd": ["Chocolate Cake", "Fruit Tart", "Red Velvet Cupcakes", "Cheesecake"],
        "TechMart Solutions": ["Wireless Mouse", "Mechanical Keyboard", "USB-C Hub", "Webcam"],
        "GreenFresh Organics": ["Organic Apples", "Fresh Spinach", "Whole Wheat Bread", "Almond Milk"],
    }

    for vendor_user in vendor_users:
        vendor_profile = vendor_user.vendor_profile
        if not vendor_profile:
            print(f"Skipping vendor {vendor_user.full_name}: no vendor profile found.")
            continue

        # Each vendor gets 3-4 products
        num_products = randint(3, 4)
        vendor_products_data = product_names.get(vendor_profile.company_name, [])
        
        for i in range(num_products):
            if not vendor_products_data:
                break # No product names available for this vendor

            product_name = vendor_products_data.pop(0) if vendor_products_data else f"Generic Product {randint(1,100)}"
            
            product = Product(
                vendor_id=vendor_user.id,
                name=product_name,
                description=f"Delicious {product_name.lower()} from {vendor_profile.company_name}.",
                price=round(uniform(5.0, 100.0), 2),
                category="Food" if "Cake" in product_name or "Tart" in product_name else "Electronics" if "Wireless" in product_name else "Organic",
                total_complaints=0,
                return_rate=round(uniform(0.01, 0.05), 3),
            )
            db.add(product)
            db.flush()  # Flush to get product ID
            all_products.append(product)

            # Some products get associated customer complaints
            if randint(0, 1):  # 50% chance of a complaint
                customer = choice(customer_users)
                complaint = ProductComplaint(
                    product_id=product.id,
                    customer_id=customer.id,
                    issue=choice(
                        [
                            "Late delivery",
                            "Spoiled cream",
                            "Item not as described",
                            "Defective product",
                        ]
                    ),
                    severity="MEDIUM",
                    status=choice([ComplaintStatus.OPEN, ComplaintStatus.RESOLVED]),
                    reported_date=datetime.now() - timedelta(days=randint(1, 10)),
                )
                all_product_complaints.append(complaint)

            # Seed product metrics
            sales_count = randint(50, 500)
            complaint_rate = round(uniform(0.01, 0.1), 2)  # 1% to 10% complaint rate
            metrics_data = {"sales_count": sales_count, "complaint_rate": complaint_rate}

            product_metrics = ProductMetrics(
                product_id=product.id,
                sales_count=sales_count,
                complaint_rate=complaint_rate,
            )
            all_product_metrics.append(product_metrics)

    db.add_all(all_product_complaints)
    db.add_all(all_product_metrics)
    db.commit()

    print(f"Seeded {len(all_products)} products for vendors")
    print(f"Seeded {len(all_product_complaints)} product complaints")
    print(f"Seeded {len(all_product_metrics)} product metrics records")

    return all_products, all_product_complaints, all_product_metrics
