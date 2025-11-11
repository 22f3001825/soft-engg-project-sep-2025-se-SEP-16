from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Supervisor(Base):
    __tablename__ = "supervisors"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    team_size = Column(Integer, nullable=True)
    managed_departments = Column(String, nullable=True)
    escalation_level = Column(Integer, nullable=True)

    # Relationship
    user = relationship("User", back_populates="supervisor")
