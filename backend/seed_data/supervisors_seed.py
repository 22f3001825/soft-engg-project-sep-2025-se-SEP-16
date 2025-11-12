"""
Supervisor portal data seeding module
Creates supervisor-specific data like team metrics and alerts.
"""
import json
from datetime import datetime, timedelta
from random import choice, randint

from app.models.analytics import SupervisorMetrics, Alert, AlertType
from app.models.user import User, UserRole
from app.models.supervisor import Supervisor
from app.models.agent import Agent


def seed_supervisor_portal_data(db, supervisor_users, agent_users):
    """Seed supervisor-specific data: team metrics and alerts."""

    all_supervisor_metrics = []
    all_alerts = []

    for supervisor_user in supervisor_users:
        # Link supervisors to agents logically (e.g., Supervisor 1 manages Agent 1, 2; Supervisor 2 manages Agent 3)
        managed_agents = []
        if supervisor_user.full_name == "Supervisor One":
            managed_agents = [
                agent for agent in agent_users if agent.full_name in ["Agent One", "Agent Two"]
            ]
        elif supervisor_user.full_name == "Supervisor Two":
            managed_agents = [agent for agent in agent_users if agent.full_name == "Agent Three"]

        # Generate team performance metrics JSON
        team_size = len(managed_agents)
        avg_resolution_time = round(
            sum([a.agent_profile.response_time for a in managed_agents]) / team_size
            if team_size > 0
            else 0.0,
            2,
        )
        tickets_closed = randint(30, 100)

        metrics_data = {
            "team_size": team_size,
            "avg_resolution_time": avg_resolution_time,
            "tickets_closed": tickets_closed,
        }

        supervisor_metrics = SupervisorMetrics(
            supervisor_id=supervisor_user.id,
            team_performance=metrics_data,
        )
        all_supervisor_metrics.append(supervisor_metrics)

        # Insert a few alerts
        alert_messages = [
            "CRITICAL: 5 unresolved HIGH-priority tickets.",
            "Agent performance below target for Agent One.",
            "System downtime detected in Customer Support portal.",
            "Escalated ticket awaiting review.",
        ]
        alert_type = choice(list(AlertType))

        alert = Alert(
            supervisor_id=supervisor_user.id,
            type=alert_type,
            message=choice(alert_messages),
            severity=randint(1, 3),
            resolved=False,
            timestamp=datetime.now() - timedelta(hours=randint(1, 48)),
        )
        all_alerts.append(alert)

    db.add_all(all_supervisor_metrics)
    db.add_all(all_alerts)
    db.commit()

    print(f"Seeded {len(all_supervisor_metrics)} supervisor metrics records")
    print(f"Seeded {len(all_alerts)} alerts for supervisors")

    return all_supervisor_metrics, all_alerts
