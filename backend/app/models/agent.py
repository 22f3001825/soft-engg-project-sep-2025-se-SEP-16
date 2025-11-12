from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Agent(Base):
    __tablename__ = "agents"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    employee_id = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), nullable=True)
    response_time = Column(Float, nullable=True)
    tickets_resolved = Column(Integer, default=0)

    # Relationship
    user = relationship("User", back_populates="agent_profile")
