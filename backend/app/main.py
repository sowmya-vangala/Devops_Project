"""
FastAPI Application Entry Point
---------------------------------
Initialises the app, configures CORS, registers routers, creates tables,
and seeds demo data for examiner access.
MSc Cloud DevOpsSec - Secure Appointment Booking System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, ServiceProvider, Appointment, UserRole, AppointmentStatus
from app.auth import hash_password
from app.routers import auth, appointments, providers

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(appointments.router)
app.include_router(providers.router)


def seed_demo_data():
    """Seed demo user, providers, and appointments for examiner access."""
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == "examiner").first():
            return
        # Create admin examiner account
        admin = User(username="examiner", email="examiner@nci.ie",
                     password_hash=hash_password("AppointBook2024"), role=UserRole.ADMIN)
        db.add(admin)
        db.flush()
        # Create sample service providers
        p1 = ServiceProvider(name="Dr. Sarah Mitchell", specialization="General Practice",
                             email="sarah@clinic.ie", phone="+353-1-234-5678",
                             available_from="09:00", available_to="17:00")
        p2 = ServiceProvider(name="Dr. James O'Brien", specialization="Dentistry",
                             email="james@dental.ie", phone="+353-1-345-6789",
                             available_from="08:00", available_to="16:00")
        p3 = ServiceProvider(name="Dr. Emily Walsh", specialization="Physiotherapy",
                             email="emily@physio.ie", phone="+353-1-456-7890",
                             available_from="10:00", available_to="18:00")
        db.add_all([p1, p2, p3])
        db.flush()
        # Create sample appointments
        appts = [
            Appointment(appointment_date="2026-04-01", appointment_time="10:00",
                        status=AppointmentStatus.SCHEDULED, reason="Annual check-up",
                        notes="Fasting required", user_id=admin.id, provider_id=p1.id),
            Appointment(appointment_date="2026-04-03", appointment_time="14:30",
                        status=AppointmentStatus.CONFIRMED, reason="Dental cleaning",
                        notes="", user_id=admin.id, provider_id=p2.id),
            Appointment(appointment_date="2026-03-20", appointment_time="11:00",
                        status=AppointmentStatus.COMPLETED, reason="Back pain consultation",
                        notes="Follow-up in 2 weeks", user_id=admin.id, provider_id=p3.id),
            Appointment(appointment_date="2026-03-15", appointment_time="09:00",
                        status=AppointmentStatus.CANCELLED, reason="Flu symptoms",
                        notes="Rescheduled", user_id=admin.id, provider_id=p1.id),
        ]
        db.add_all(appts)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        seed_demo_data()
    except Exception:
        pass


@app.get("/actuator/health")
def health_check():
    return {"status": "UP", "application": settings.APP_NAME}
