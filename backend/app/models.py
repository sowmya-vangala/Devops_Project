"""
SQLAlchemy ORM Models
----------------------
Defines the database schema for the Appointment Booking System.
Three core models: User, ServiceProvider, and Appointment.
MSc Cloud DevOpsSec - Secure Appointment Booking System
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Date, Time, Enum, Text
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    ADMIN = "ADMIN"


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class User(Base):
    """User model with role-based access control (PATIENT or ADMIN)."""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PATIENT, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")


class ServiceProvider(Base):
    """Service provider model with soft-delete support."""
    __tablename__ = "service_providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    available_from = Column(String(10), default="09:00")
    available_to = Column(String(10), default="17:00")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    appointments = relationship("Appointment", back_populates="provider")


class Appointment(Base):
    """Appointment model linking users to service providers."""
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    appointment_date = Column(String(10), nullable=False)
    appointment_time = Column(String(10), nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED, nullable=False)
    reason = Column(String(500), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    user = relationship("User", back_populates="appointments")
    provider = relationship("ServiceProvider", back_populates="appointments")
