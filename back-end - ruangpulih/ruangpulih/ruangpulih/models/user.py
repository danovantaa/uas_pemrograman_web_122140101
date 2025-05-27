import uuid
from sqlalchemy import Column, String, Enum
from sqlalchemy.orm import relationship
from passlib.hash import bcrypt
from .meta import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)

    role = Column(
        Enum("client", "psychologist", name="role_enum"),
        nullable=False
    )

    schedules = relationship("Schedule", back_populates="psychologist")
    bookings = relationship("Booking", back_populates="client")

    def set_password(self, raw_password):
        self.password = bcrypt.hash(raw_password)

    def check_password(self, raw_password):
        return bcrypt.verify(raw_password, self.password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role
        }

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}', role='{self.role}')>"
