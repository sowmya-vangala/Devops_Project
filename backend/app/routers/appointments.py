"""
Appointments router - CRUD for appointment booking.
All endpoints require authentication. Users can only access their own appointments.
Includes conflict detection to prevent double-booking (both provider and user level),
and time-based validation to prevent marking future appointments as completed.
MSc Cloud DevOpsSec - Secure Appointment Booking System
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Appointment, ServiceProvider, User, AppointmentStatus
from app.schemas import AppointmentRequest, AppointmentResponse, StatusUpdateRequest
from app.auth import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


def to_response(a: Appointment) -> dict:
    return {
        "id": a.id,
        "appointmentDate": a.appointment_date,
        "appointmentTime": a.appointment_time,
        "status": a.status.value if a.status else "SCHEDULED",
        "reason": a.reason,
        "notes": a.notes or "",
        "createdAt": a.created_at,
        "updatedAt": a.updated_at,
        "providerId": a.provider_id,
        "providerName": a.provider.name if a.provider else None,
        "providerSpecialization": a.provider.specialization if a.provider else None,
    }


SLOT_DURATION_MINUTES = 45  # Minimum gap between appointments for the same provider or user


def _parse_time_minutes(time_str: str) -> int:
    """Convert HH:MM string to total minutes since midnight."""
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])


def _times_overlap(existing_time: str, new_time: str) -> bool:
    """Check if two appointment times are within SLOT_DURATION_MINUTES of each other."""
    existing_mins = _parse_time_minutes(existing_time)
    new_mins = _parse_time_minutes(new_time)
    return abs(existing_mins - new_mins) < SLOT_DURATION_MINUTES


def check_provider_conflict(db: Session, provider_id: int, date: str, time: str, exclude_id: int = None):
    """Prevent double-booking: same provider must have at least 30 min gap between appointments."""
    query = db.query(Appointment).filter(
        Appointment.provider_id == provider_id,
        Appointment.appointment_date == date,
        Appointment.status != AppointmentStatus.CANCELLED,
    )
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    for existing in query.all():
        if _times_overlap(existing.appointment_time, time):
            raise HTTPException(
                status_code=409,
                detail=f"This provider is already booked near that time. Appointments must be at least {SLOT_DURATION_MINUTES} minutes apart."
            )


def check_user_conflict(db: Session, user_id: int, date: str, time: str, exclude_id: int = None):
    """Prevent double-booking: same user must have at least 30 min gap between appointments."""
    query = db.query(Appointment).filter(
        Appointment.user_id == user_id,
        Appointment.appointment_date == date,
        Appointment.status != AppointmentStatus.CANCELLED,
    )
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    for existing in query.all():
        if _times_overlap(existing.appointment_time, time):
            raise HTTPException(
                status_code=409,
                detail=f"You already have an appointment near that time. Appointments must be at least {SLOT_DURATION_MINUTES} minutes apart."
            )


def check_not_past_date(date: str, time: str):
    """Prevent booking appointments in the past."""
    try:
        appt_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        appt_dt = appt_dt.replace(tzinfo=timezone.utc)
        if appt_dt < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Cannot book an appointment in the past")
    except ValueError:
        pass  # Let Pydantic handle format validation


def check_can_complete(date: str, time: str):
    """Only allow marking as completed if at least 20 minutes have passed since the appointment time."""
    try:
        appt_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        appt_dt = appt_dt.replace(tzinfo=timezone.utc)
        earliest_complete = appt_dt + timedelta(minutes=20)
        if datetime.now(timezone.utc) < earliest_complete:
            raise HTTPException(
                status_code=400,
                detail="Cannot mark as completed until 20 minutes after the appointment time"
            )
    except ValueError:
        pass


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """List all appointments for the authenticated user."""
    appts = db.query(Appointment).filter(Appointment.user_id == user.id).order_by(Appointment.appointment_date.desc()).all()
    return [to_response(a) for a in appts]


@router.get("/{appt_id}", response_model=AppointmentResponse)
def get_appointment(appt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get a single appointment by ID (user-scoped to prevent IDOR)."""
    appt = db.query(Appointment).filter(Appointment.id == appt_id, Appointment.user_id == user.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return to_response(appt)


@router.post("", response_model=AppointmentResponse, status_code=201)
def create_appointment(request: AppointmentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Book a new appointment with conflict detection and date validation."""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == request.providerId, ServiceProvider.is_active == True).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    check_not_past_date(request.appointmentDate, request.appointmentTime)
    check_provider_conflict(db, request.providerId, request.appointmentDate, request.appointmentTime)
    check_user_conflict(db, user.id, request.appointmentDate, request.appointmentTime)
    appt = Appointment(
        appointment_date=request.appointmentDate,
        appointment_time=request.appointmentTime,
        reason=request.reason,
        notes=request.notes or "",
        user_id=user.id,
        provider_id=request.providerId,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return to_response(appt)


@router.put("/{appt_id}", response_model=AppointmentResponse)
def update_appointment(appt_id: int, request: AppointmentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Update an existing appointment with conflict detection."""
    appt = db.query(Appointment).filter(Appointment.id == appt_id, Appointment.user_id == user.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == request.providerId, ServiceProvider.is_active == True).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    check_not_past_date(request.appointmentDate, request.appointmentTime)
    check_provider_conflict(db, request.providerId, request.appointmentDate, request.appointmentTime, exclude_id=appt_id)
    check_user_conflict(db, user.id, request.appointmentDate, request.appointmentTime, exclude_id=appt_id)
    appt.appointment_date = request.appointmentDate
    appt.appointment_time = request.appointmentTime
    appt.reason = request.reason
    appt.notes = request.notes or ""
    appt.provider_id = request.providerId
    # Update status if provided (for cancel/complete actions)
    if request.status and request.status in [s.value for s in AppointmentStatus]:
        if request.status == "COMPLETED":
            check_can_complete(appt.appointment_date, appt.appointment_time)
        appt.status = AppointmentStatus(request.status)
    db.commit()
    db.refresh(appt)
    return to_response(appt)


@router.patch("/{appt_id}/status", response_model=AppointmentResponse)
def update_appointment_status(appt_id: int, request: StatusUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Update only the status of an appointment (cancel or complete)."""
    appt = db.query(Appointment).filter(Appointment.id == appt_id, Appointment.user_id == user.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if request.status not in [s.value for s in AppointmentStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    # Enforce 20-minute rule for marking as completed
    if request.status == "COMPLETED":
        check_can_complete(appt.appointment_date, appt.appointment_time)
    appt.status = AppointmentStatus(request.status)
    db.commit()
    db.refresh(appt)
    return to_response(appt)


@router.delete("/{appt_id}", status_code=204)
def delete_appointment(appt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete an appointment (user-scoped)."""
    appt = db.query(Appointment).filter(Appointment.id == appt_id, Appointment.user_id == user.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
