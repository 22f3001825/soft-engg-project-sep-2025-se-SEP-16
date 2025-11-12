"""
Agent portal data seeding module
Creates agent-specific data like assigned tickets, messages, and agent statistics.
"""
from datetime import datetime, timedelta
from random import choice, randint

from app.models.ticket import Message, Ticket, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.models.analytics import AgentStats
from app.models.customer import Customer
from app.models.agent import Agent


def seed_agent_portal_data(db, agent_users, customer_users, all_tickets):
    """Seed agent-specific data: assigned tickets, messages, and agent statistics."""

    all_agent_stats = []
    
    # Ensure there are enough tickets to assign
    assignable_tickets = [t for t in all_tickets if t.agent_id is None]
    
    for agent_user in agent_users:
        # Assign 3-5 tickets to each agent
        num_tickets_to_assign = randint(3, 5)
        
        for _ in range(num_tickets_to_assign):
            if assignable_tickets:
                ticket = choice(assignable_tickets)
                ticket.agent_id = agent_user.id
                ticket.status = choice([TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED])
                
                # Add agent message to the ticket
                message_agent = Message(
                    ticket_id=ticket.id,
                    sender_id=agent_user.id,
                    sender_name=agent_user.full_name,
                    content=f"Agent {agent_user.full_name} is now handling this ticket.",
                    timestamp=ticket.created_at + timedelta(hours=randint(1, 5)),
                )
                db.add(message_agent)
                
                # Remove assigned ticket from assignable list
                assignable_tickets.remove(ticket)
            else:
                # If no more unassigned tickets, create new ones
                customer = choice(customer_users)
                ticket_status = choice([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
                ticket_priority = choice(list(TicketPriority))
                
                ticket = Ticket(
                    customer_id=customer.id,
                    agent_id=agent_user.id,
                    subject=f"New issue for customer {customer.full_name}",
                    status=ticket_status,
                    priority=ticket_priority,
                    created_at=datetime.now() - timedelta(days=randint(1, 10)),
                )
                db.add(ticket)
                db.flush() # Flush to get ticket ID
                all_tickets.append(ticket) # Add to the list of all tickets

                message_customer = Message(
                    ticket_id=ticket.id,
                    sender_id=customer.id,
                    sender_name=customer.full_name,
                    content=f"Customer {customer.full_name} created a new ticket.",
                    timestamp=ticket.created_at + timedelta(minutes=randint(5, 60)),
                )
                db.add(message_customer)

                message_agent = Message(
                    ticket_id=ticket.id,
                    sender_id=agent_user.id,
                    sender_name=agent_user.full_name,
                    content=f"Agent {agent_user.full_name} is now handling this ticket.",
                    timestamp=ticket.created_at + timedelta(hours=randint(1, 5)),
                )
                db.add(message_agent)


        # Generate analytics snapshot for agent
        agent_stats = AgentStats(
            agent_id=agent_user.id,
            total_tickets=randint(10, 50),
            avg_response_time=round((agent_user.agent_profile.response_time or 3.0) + (randint(-10, 10) / 10.0), 2),
        )
        all_agent_stats.append(agent_stats)

    db.add_all(all_agent_stats)
    db.commit()

    print(f"Assigned tickets to agents and added messages")
    print(f"Seeded {len(all_agent_stats)} agent statistics records")
    
    return all_agent_stats
