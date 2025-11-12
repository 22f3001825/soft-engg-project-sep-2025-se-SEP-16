"""
Orders seeding module
Creates orders with order items and tracking info for customers
"""
import uuid
from app.models.order import Order, OrderItem, OrderStatus, TrackingInfo
from app.models.customer import Customer
from app.models.product import Product
from datetime import datetime, timedelta
import random


def seed_orders(db):
    """Seed orders for customers"""
    
    # Get all customers
    customers = db.query(Customer).all()
    
    # Get all products for order items
    products = db.query(Product).all()
    
    orders_data = [
        # Customer 1 (Ali Jawad) - 3 orders
        {
            "customer_idx": 0,
            "status": OrderStatus.DELIVERED,
            "days_ago": 15,
            "product_indices": [0, 3]  # Chocolate Cake, Chocolate Box
        },
        {
            "customer_idx": 0,
            "status": OrderStatus.SHIPPED,
            "days_ago": 3,
            "product_indices": [4, 5]  # Headphones, Phone Stand
        },
        {
            "customer_idx": 0,
            "status": OrderStatus.PROCESSING,
            "days_ago": 1,
            "product_indices": [8]  # Vegetables Box
        },
        # Customer 2 (Rachita Vohra) - 2 orders
        {
            "customer_idx": 1,
            "status": OrderStatus.DELIVERED,
            "days_ago": 20,
            "product_indices": [1, 2]  # Fruit Tart, Wedding Cake
        },
        {
            "customer_idx": 1,
            "status": OrderStatus.DELIVERED,
            "days_ago": 8,
            "product_indices": [9, 10]  # Fruit Basket, Honey
        },
        # Customer 3 (Harsh Mathur) - 2 orders
        {
            "customer_idx": 2,
            "status": OrderStatus.PENDING,
            "days_ago": 0,
            "product_indices": [6, 7]  # USB-C Hub, Wireless Charger
        },
        {
            "customer_idx": 2,
            "status": OrderStatus.CANCELLED,
            "days_ago": 5,
            "product_indices": [4]  # Headphones
        },
        # Customer 4 (Priya Mehta) - 2 orders
        {
            "customer_idx": 3,
            "status": OrderStatus.SHIPPED,
            "days_ago": 2,
            "product_indices": [0, 1, 3]  # Chocolate Cake, Fruit Tart, Chocolate Box
        },
        {
            "customer_idx": 3,
            "status": OrderStatus.RETURNED,
            "days_ago": 12,
            "product_indices": [5]  # Phone Stand
        },
        # Customer 5 (Aman Verma) - 3 orders
        {
            "customer_idx": 4,
            "status": OrderStatus.DELIVERED,
            "days_ago": 25,
            "product_indices": [11]  # Quinoa
        },
        {
            "customer_idx": 4,
            "status": OrderStatus.DELIVERED,
            "days_ago": 10,
            "product_indices": [8, 9]  # Vegetables Box, Fruit Basket
        },
        {
            "customer_idx": 4,
            "status": OrderStatus.PROCESSING,
            "days_ago": 1,
            "product_indices": [6]  # USB-C Hub
        }
    ]
    
    all_orders = []
    all_order_items = []
    
    for order_data in orders_data:
        if order_data["customer_idx"] < len(customers):
            customer = customers[order_data["customer_idx"]]
            order_id = f"ORD{str(uuid.uuid4())[:8].upper()}"
            
            # Calculate order total
            order_total = 0.0
            order_items = []
            
            for prod_idx in order_data["product_indices"]:
                if prod_idx < len(products):
                    product = products[prod_idx]
                    quantity = random.randint(1, 3)
                    subtotal = product.price * quantity
                    order_total += subtotal
                    
                    order_item = OrderItem(
                        id=str(uuid.uuid4()),
                        order_id=order_id,
                        product_id=product.id,
                        product_name=product.name,
                        quantity=quantity,
                        price=product.price,
                        subtotal=subtotal
                    )
                    order_items.append(order_item)
            
            # Create order
            order_date = datetime.utcnow() - timedelta(days=order_data["days_ago"])
            estimated_delivery = order_date + timedelta(days=7)
            
            order = Order(
                id=order_id,
                customer_id=customer.user_id,
                status=order_data["status"],
                total=round(order_total, 2),
                created_at=order_date,
                tracking_number=f"TRK{str(uuid.uuid4())[:10].upper()}",
                estimated_delivery=estimated_delivery
            )
            
            all_orders.append(order)
            all_order_items.extend(order_items)
            
            # Update customer's total_orders
            customer.total_orders += 1
    
    db.add_all(all_orders)
    db.add_all(all_order_items)
    db.commit()
    
    print(f"Seeded {len(all_orders)} orders with {len(all_order_items)} order items")
    return all_orders, all_order_items


def seed_tracking_info(db):
    """Seed tracking information for orders"""
    
    # Get all orders
    orders = db.query(Order).all()
    
    tracking_data = []
    
    for order in orders:
        # Determine tracking status based on order status
        if order.status == OrderStatus.PENDING:
            current_location = "Warehouse - Processing"
            status = "Order Received"
            courier = "FastShip Express"
        elif order.status == OrderStatus.PROCESSING:
            current_location = "Warehouse - Packing"
            status = "Preparing for Shipment"
            courier = "FastShip Express"
        elif order.status == OrderStatus.SHIPPED:
            current_location = "Regional Hub - Mumbai"
            status = "In Transit"
            courier = "FastShip Express"
        elif order.status == OrderStatus.DELIVERED:
            current_location = "Delivered to Customer"
            status = "Delivered"
            courier = "FastShip Express"
        elif order.status == OrderStatus.CANCELLED:
            current_location = "Warehouse"
            status = "Order Cancelled"
            courier = "N/A"
        elif order.status == OrderStatus.RETURNED:
            current_location = "Return Processing Center"
            status = "Return In Progress"
            courier = "FastShip Express"
        else:
            current_location = "Unknown"
            status = "Unknown"
            courier = "N/A"
        
        tracking_info = TrackingInfo(
            tracking_number=order.tracking_number,
            current_location=current_location,
            status=status,
            estimated_delivery=order.estimated_delivery,
            courier_name=courier,
            courier_contact="+91-1800-123-4567" if courier != "N/A" else "N/A"
        )
        tracking_data.append(tracking_info)
    
    db.add_all(tracking_data)
    db.commit()
    
    print(f"Seeded {len(tracking_data)} tracking records")
    return tracking_data
