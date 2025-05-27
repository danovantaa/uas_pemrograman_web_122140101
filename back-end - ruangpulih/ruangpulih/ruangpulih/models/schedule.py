import uuid
from sqlalchemy import Column, String, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .meta import Base

class Schedule(Base):
    __tablename__ = 'schedules'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    psychologist_id = Column(String, ForeignKey('users.id'))
    date = Column(Date, nullable=False)
    time_slot = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False)

    psychologist = relationship("User", back_populates="schedules")
    bookings = relationship("Booking", back_populates="schedule", uselist=True, cascade="all, delete-orphan")

    def to_dict(self):
        data = {
            "id": self.id,
            "psychologist_id": self.psychologist_id,
            "date": self.date.isoformat(),
            "time_slot": self.time_slot.strftime('%H:%M'),
            "is_booked": self.is_booked
        }

        # Find the current active booking if the schedule is booked.
        # This assumes a schedule typically has one 'active' booking at a time.
        # You might need to refine the filtering logic if there are multiple bookings
        # and you need a specific one (e.g., 'confirmed' status, or latest).
        current_booking = None
        if self.is_booked and self.bookings:
            current_booking = next((b for b in self.bookings if b.status == 'confirmed'), None)
            if not current_booking:
                current_booking = self.bookings[0]

        if current_booking:
            data['current_booking'] = current_booking.to_dict()

        return data

    def __repr__(self):
        return (
            f"<Schedule(id='{self.id}', psychologist_id='{self.psychologist_id}', "
            f"date='{self.date}', time_slot='{self.time_slot}', booked={self.is_booked})>"
        )
