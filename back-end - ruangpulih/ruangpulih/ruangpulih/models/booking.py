import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .meta import Base

class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey('users.id'))
    schedule_id = Column(String, ForeignKey('schedules.id'))
    status = Column(Enum("pending", "confirmed", "rejected", name="booking_status"), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", back_populates="bookings")
    schedule = relationship("Schedule", back_populates="bookings")

    def to_dict(self):
        data = {
            "id": self.id,
            "client_id": self.client_id,
            "schedule_id": self.schedule_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        
        if self.client:
            data['client_details'] = self.client.to_dict()

        return data

    def __repr__(self):
        return (
            f"<Booking(id='{self.id}', client_id='{self.client_id}', "
            f"schedule_id='{self.schedule_id}', status='{self.status}')>"
        )
