import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .meta import Base

class Review(Base):
    __tablename__ = 'reviews'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey('bookings.id'), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)

    booking = relationship("Booking")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "rating": self.rating,
            "comment": self.comment
        }

    def __repr__(self):
        return (
            f"<Review(id='{self.id}', booking_id='{self.booking_id}', "
            f"rating='{self.rating}')>"
        )
