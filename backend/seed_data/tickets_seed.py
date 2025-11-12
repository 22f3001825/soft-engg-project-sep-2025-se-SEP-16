"""
Tickets seeding module
Creates support tickets with messages and attachments
"""
import uuid
from app.models.ticket import Ticket, Message, Attachment, TicketStatus, TicketPriority
from app.models.customer import Customer
from app.models.agent import Agent
from app.models.user import User
from datetime import datetime, timedelta


def seed_tickets(db):
    """Seed support tickets for customers"""
    
    # Get all customers
    customers = db.query(Customer).all()
    
    # Get all agents
    agents = db.query(Agent).all()
    
    tickets_data = [
        # Customer 1 (Ali Jawad) - 2 tickets
        {
            "customer_idx": 0,
            "agent_idx": 0,
            "subject": "Refund not received for cancelled order",
            "status": TicketStatus.OPEN,
            "priority": TicketPriority.HIGH,
            "days_ago": 2
        },
        {
            "customer_idx": 0,
            "agent_idx": 1,
            "subject": "Product damaged during delivery",
            "status": TicketStatus.RESOLVED,
            "priority": TicketPriority.MEDIUM,
            "days_ago": 10
        },
        # Customer 2 (Rachita Vohra) - 2 tickets
        {
            "customer_idx": 1,
            "agent_idx": 0,
            "subject": "Unable to track my order",
            "status": TicketStatus.IN_PROGRESS,
            "priority": TicketPriority.MEDIUM,
            "days_ago": 1
        },
        {
            "customer_idx": 1,
            "agent_idx": 2,
            "subject": "Question about wedding cake customization",
            "status": TicketStatus.CLOSED,
            "priority": TicketPriority.LOW,
            "days_ago": 25
        },
        # Customer 3 (Harsh Mathur) - 2 tickets
        {
            "customer_idx": 2,
            "agent_idx": 1,
            "subject": "Wrong item delivered in my order",
            "status": TicketStatus.IN_PROGRESS,
            "priority": TicketPriority.HIGH,
            "days_ago": 3
        },
        {
            "customer_idx": 2,
            "agent_idx": 0,
            "subject": "How to cancel my pending order?",
            "status": TicketStatus.WAITING_FOR_CUSTOMER,
            "priority": TicketPriority.MEDIUM,
            "days_ago": 5
        },
        # Customer 4 (Priya Mehta) - 1 ticket
        {
            "customer_idx": 3,
            "agent_idx": 2,
            "subject": "Payment deducted twice for same order",
            "status": TicketStatus.OPEN,
            "priority": TicketPriority.CRITICAL,
            "days_ago": 1
        },
        # Customer 5 (Aman Verma) - 2 tickets
        {
            "customer_idx": 4,
            "agent_idx": 1,
            "subject": "Return request for organic products",
            "status": TicketStatus.RESOLVED,
            "priority": TicketPriority.MEDIUM,
            "days_ago": 15
        },
        {
            "customer_idx": 4,
            "agent_idx": 0,
            "subject": "Inquiry about bulk order discounts",
            "status": TicketStatus.CLOSED,
            "priority": TicketPriority.LOW,
            "days_ago": 30
        }
    ]
    
    all_tickets = []
    
    for ticket_data in tickets_data:
        if ticket_data["customer_idx"] < len(customers) and ticket_data["agent_idx"] < len(agents):
            customer = customers[ticket_data["customer_idx"]]
            agent = agents[ticket_data["agent_idx"]]
            
            ticket_date = datetime.utcnow() - timedelta(days=ticket_data["days_ago"])
            
            ticket = Ticket(
                id=f"TKT{str(uuid.uuid4())[:8].upper()}",
                customer_id=customer.user_id,
                agent_id=agent.user_id,
                subject=ticket_data["subject"],
                status=ticket_data["status"],
                priority=ticket_data["priority"],
                created_at=ticket_date,
                updated_at=ticket_date
            )
            
            all_tickets.append(ticket)
            
            # Update customer's total_tickets
            customer.total_tickets += 1
            
            # Update agent's tickets_resolved if ticket is resolved/closed
            if ticket_data["status"] in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
                agent.tickets_resolved += 1
    
    db.add_all(all_tickets)
    db.commit()
    
    print(f"Seeded {len(all_tickets)} tickets")
    return all_tickets


def seed_messages(db):
    """Seed messages for tickets"""
    
    # Get all tickets
    tickets = db.query(Ticket).all()
    
    # Get users for message senders
    users = db.query(User).all()
    user_map = {user.id: user for user in users}
    
    all_messages = []
    
    for ticket in tickets:
        ticket_age = (datetime.utcnow() - ticket.created_at).days
        
        # Initial message from customer
        initial_message = Message(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            sender_id=ticket.customer_id,
            sender_name=user_map[ticket.customer_id].full_name,
            content=f"Hi, I'm facing an issue: {ticket.subject}. Can you please help me resolve this?",
            timestamp=ticket.created_at,
            is_internal=False
        )
        all_messages.append(initial_message)
        
        # Agent response
        agent_response_time = ticket.created_at + timedelta(hours=2)
        agent_response = Message(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            sender_id=ticket.agent_id,
            sender_name=user_map[ticket.agent_id].full_name,
            content="Thank you for contacting us. I'm looking into your issue and will get back to you shortly with a resolution.",
            timestamp=agent_response_time,
            is_internal=False
        )
        all_messages.append(agent_response)
        
        # If ticket is in progress or resolved, add follow-up messages
        if ticket.status in [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            customer_followup_time = agent_response_time + timedelta(hours=4)
            customer_followup = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=ticket.customer_id,
                sender_name=user_map[ticket.customer_id].full_name,
                content="Thank you for your response. I'm waiting for an update on this issue.",
                timestamp=customer_followup_time,
                is_internal=False
            )
            all_messages.append(customer_followup)
            
            agent_update_time = customer_followup_time + timedelta(hours=6)
            agent_update = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=ticket.agent_id,
                sender_name=user_map[ticket.agent_id].full_name,
                content="I've escalated your issue to the relevant department. You should receive a resolution within 24-48 hours.",
                timestamp=agent_update_time,
                is_internal=False
            )
            all_messages.append(agent_update)
        
        # If ticket is resolved or closed, add resolution message
        if ticket.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            resolution_time = ticket.created_at + timedelta(days=min(ticket_age, 2))
            resolution_message = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=ticket.agent_id,
                sender_name=user_map[ticket.agent_id].full_name,
                content="Your issue has been resolved. If you have any further questions, please don't hesitate to contact us.",
                timestamp=resolution_time,
                is_internal=False
            )
            all_messages.append(resolution_message)
        
        # If ticket is waiting for customer, add waiting message
        if ticket.status == TicketStatus.WAITING_FOR_CUSTOMER:
            waiting_time = ticket.created_at + timedelta(days=1)
            waiting_message = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=ticket.agent_id,
                sender_name=user_map[ticket.agent_id].full_name,
                content="We need some additional information from you to proceed. Please provide the order number and any relevant details.",
                timestamp=waiting_time,
                is_internal=False
            )
            all_messages.append(waiting_message)
        
        # Add internal note for some tickets
        if ticket.priority in [TicketPriority.HIGH, TicketPriority.CRITICAL]:
            internal_note_time = ticket.created_at + timedelta(hours=1)
            internal_note = Message(
                id=str(uuid.uuid4()),
                ticket_id=ticket.id,
                sender_id=ticket.agent_id,
                sender_name=user_map[ticket.agent_id].full_name,
                content="High priority ticket - needs immediate attention. Checking with supervisor.",
                timestamp=internal_note_time,
                is_internal=True
            )
            all_messages.append(internal_note)
    
    db.add_all(all_messages)
    db.commit()
    
    print(f"Seeded {len(all_messages)} messages")
    return all_messages


def seed_attachments(db):
    """Seed attachments for some messages"""
    
    # Get first 5 messages to add attachments
    messages = db.query(Message).filter(Message.is_internal == False).limit(5).all()
    
    attachments_data = [
        {
            "file_name": "order_screenshot.png",
            "file_size": 245678,
            "file_type": "image/png"
        },
        {
            "file_name": "invoice.pdf",
            "file_size": 156432,
            "file_type": "application/pdf"
        },
        {
            "file_name": "product_image.jpg",
            "file_size": 524288,
            "file_type": "image/jpeg"
        },
        {
            "file_name": "receipt.pdf",
            "file_size": 98765,
            "file_type": "application/pdf"
        },
        {
            "file_name": "damage_photo.jpg",
            "file_size": 412345,
            "file_type": "image/jpeg"
        }
    ]
    
    all_attachments = []
    
    for idx, message in enumerate(messages):
        if idx < len(attachments_data):
            attachment = Attachment(
                id=str(uuid.uuid4()),
                message_id=message.id,
                file_name=attachments_data[idx]["file_name"],
                file_size=attachments_data[idx]["file_size"],
                file_type=attachments_data[idx]["file_type"]
            )
            all_attachments.append(attachment)
    
    db.add_all(all_attachments)
    db.commit()
    
    print(f"Seeded {len(all_attachments)} attachments")
    return all_attachments
