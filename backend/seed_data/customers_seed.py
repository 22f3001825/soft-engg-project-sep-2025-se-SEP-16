"""
Customer portal data seeding module
Creates orders, order items, tracking info, tickets, messages, and notifications for customers.
"""
from datetime import datetime, timedelta
from random import choice, randint, sample

from app.models.order import Order, OrderItem, OrderStatus, TrackingInfo
from app.models.product import Product
from app.models.ticket import Message, Ticket, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.models.analytics import Notification, NotificationType


def seed_customer_portal_data(db, customer_users, agent_users, products):
    """Seed customer-specific data: orders, tickets, notifications."""

    all_orders = []
    all_order_items = []
    all_tracking_info = []
    all_tickets = []
    all_messages = []
    all_notifications = []

    for customer_user in customer_users:
        # Each customer gets 2-3 orders
        num_orders = randint(2, 3)
        for i in range(num_orders):
            order_date = datetime.now() - timedelta(days=randint(1, 30))
            order_status = choice(list(OrderStatus))
            order = Order(
                customer_id=customer_user.id,
                status=order_status,
                total=0.0,  # Will be updated after adding items
                created_at=order_date,
                tracking_number=f"TRK{customer_user.id:03d}{i:02d}{randint(100, 999)}",
                estimated_delivery=order_date + timedelta(days=7)
            )
            db.add(order)
            db.flush()  # Flush to get order ID

            # Each order gets 2-4 order items
            order_total = 0.0
            num_items = randint(2, 4)
            selected_products = sample(products, min(num_items, len(products)))
            for product in selected_products:
                quantity = randint(1, 3)
                item_total = product.price * quantity
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    quantity=quantity,
                    price=product.price,
                    subtotal=item_total,
                )
                all_order_items.append(order_item)
                order_total += item_total

            order.total = order_total
            all_orders.append(order)

            # Add tracking info for each order
            if order_status != OrderStatus.PENDING:
                tracking = TrackingInfo(
                    tracking_number=order.tracking_number,
                    current_location=choice(["Mumbai Hub", "Delhi Hub", "Bangalore Hub"]),
                    status=choice(["Shipped", "Out for Delivery", "Delivered"]),
                    estimated_delivery=order.estimated_delivery,
                    courier_name=choice(["FedEx", "UPS", "DHL"]),
                    courier_contact="+91-1800-123-4567"
                )
                all_tracking_info.append(tracking)

            # Add a notification for the order
            notification = Notification(
                user_id=customer_user.id,
                title="Order Update",
                message=f"Your order {order.id} has been {order_status.value.lower()}.",
                type=NotificationType.ORDER,
                is_read=False,
                created_at=datetime.now(),
            )
            all_notifications.append(notification)

        # 1-2 open or resolved tickets per customer
        num_tickets = randint(1, 2)
        for i in range(num_tickets):
            ticket_status = choice([TicketStatus.OPEN, TicketStatus.RESOLVED])
            ticket_priority = choice(list(TicketPriority))
            assigned_agent = choice(agent_users) if agent_users else None

            ticket = Ticket(
                customer_id=customer_user.id,
                agent_id=assigned_agent.id if assigned_agent else None,
                subject=f"Issue with Order {choice(all_orders).id}"
                if all_orders
                else "General Inquiry",
                status=ticket_status,
                priority=ticket_priority,
                created_at=datetime.now() - timedelta(days=randint(1, 15)),
            )
            db.add(ticket)
            db.flush()  # Flush to get ticket ID
            all_tickets.append(ticket)

            # Add messages for the ticket (customer and agent)
            message_customer = Message(
                ticket_id=ticket.id,
                sender_id=customer_user.id,
                sender_name=customer_user.full_name,
                content=f"Customer {customer_user.full_name} reporting issue.",
                timestamp=ticket.created_at + timedelta(minutes=randint(5, 60)),
            )
            all_messages.append(message_customer)

            if assigned_agent and ticket_status == TicketStatus.RESOLVED:
                message_agent = Message(
                    ticket_id=ticket.id,
                    sender_id=assigned_agent.id,
                    sender_name=assigned_agent.full_name,
                    content=f"Agent {assigned_agent.full_name} has resolved the issue.",
                    timestamp=ticket.created_at + timedelta(hours=randint(1, 24)),
                )
                all_messages.append(message_agent)

            # Add a notification for ticket update
            notification = Notification(
                user_id=customer_user.id,
                title="Ticket Update",
                message=f"Your ticket {ticket.id} has been {ticket_status.value.lower()}.",
                type=NotificationType.TICKET,
                read=False,
                timestamp=datetime.now(),
            )
            all_notifications.append(notification)

    db.add_all(all_order_items)
    db.add_all(all_tracking_info)
    db.add_all(all_messages)
    db.add_all(all_notifications)
    db.commit()

    print(f"Seeded {len(all_orders)} orders for customers")
    print(f"Seeded {len(all_order_items)} order items")
    print(f"Seeded {len(all_tracking_info)} tracking info records")
    print(f"Seeded {len(all_tickets)} tickets for customers")
    print(f"Seeded {len(all_messages)} messages for tickets")
    print(f"Seeded {len(all_notifications)} notifications for customers")

    return all_orders, all_tickets, all_notifications
