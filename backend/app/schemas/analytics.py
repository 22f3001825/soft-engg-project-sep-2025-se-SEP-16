from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.analytics import AlertType, NotificationType

class AgentStatsBase(BaseModel):
    total_tickets: int
    avg_response_time: float

class AgentStats(AgentStatsBase):
    agent_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

class SupervisorMetricsBase(BaseModel):
    team_performance: dict

class SupervisorMetrics(SupervisorMetricsBase):
    supervisor_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductMetricsBase(BaseModel):
    sales_count: int
    complaint_rate: float

class ProductMetrics(ProductMetricsBase):
    product_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    user_id: UUID
    read: bool
    timestamp: datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    type: AlertType
    message: str
    severity: int

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    timestamp: datetime
    resolved: bool
    supervisor_id: UUID

    class Config:
        from_attributes = True
