"""
Pydantic Schemas for request/response validation.
MSc Cloud DevOpsSec - Secure Appointment Booking System
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# Auth schemas
class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class AuthResponse(BaseModel):
    token: str
    username: str
    role: str


class MessageResponse(BaseModel):
    message: str


# Provider schemas
class ProviderRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    specialization: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)
    availableFrom: str = Field(default="09:00")
    availableTo: str = Field(default="17:00")


class ProviderResponse(BaseModel):
    id: int
    name: str
    specialization: str
    email: str
    phone: str
    availableFrom: str
    availableTo: str
    isActive: bool
    createdAt: Optional[datetime] = None
    class Config:
        from_attributes = True


# Appointment schemas
class AppointmentRequest(BaseModel):
    appointmentDate: str = Field(..., min_length=10, max_length=10)
    appointmentTime: str = Field(..., min_length=5, max_length=5)
    reason: str = Field(..., min_length=2, max_length=500)
    notes: Optional[str] = Field(default="", max_length=1000)
    providerId: int
    status: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., min_length=1)


class AppointmentResponse(BaseModel):
    id: int
    appointmentDate: str
    appointmentTime: str
    status: str
    reason: str
    notes: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    providerId: int
    providerName: Optional[str] = None
    providerSpecialization: Optional[str] = None
    class Config:
        from_attributes = True
