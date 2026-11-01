"""
Service Providers router - CRUD for service providers.
GET is public (authenticated), POST/PUT/DELETE require ADMIN role.
MSc Cloud DevOpsSec - Secure Appointment Booking System
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ServiceProvider, User, UserRole
from app.schemas import ProviderRequest, ProviderResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/providers", tags=["Service Providers"])


def to_response(p: ServiceProvider) -> dict:
    return {
        "id": p.id, "name": p.name, "specialization": p.specialization,
        "email": p.email, "phone": p.phone,
        "availableFrom": p.available_from, "availableTo": p.available_to,
        "isActive": p.is_active, "createdAt": p.created_at,
    }


def require_admin(user: User):
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("", response_model=List[ProviderResponse])
def get_providers(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """List all active service providers."""
    providers = db.query(ServiceProvider).filter(ServiceProvider.is_active == True).all()
    return [to_response(p) for p in providers]


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return to_response(provider)


@router.post("", response_model=ProviderResponse, status_code=201)
def create_provider(request: ProviderRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new service provider (admin only)."""
    require_admin(user)
    provider = ServiceProvider(
        name=request.name, specialization=request.specialization,
        email=request.email, phone=request.phone,
        available_from=request.availableFrom, available_to=request.availableTo,
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return to_response(provider)


@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider(provider_id: int, request: ProviderRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Update a service provider (admin only)."""
    require_admin(user)
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider.name = request.name
    provider.specialization = request.specialization
    provider.email = request.email
    provider.phone = request.phone
    provider.available_from = request.availableFrom
    provider.available_to = request.availableTo
    db.commit()
    db.refresh(provider)
    return to_response(provider)


@router.delete("/{provider_id}", status_code=204)
def delete_provider(provider_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Soft-delete a service provider (admin only)."""
    require_admin(user)
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider.is_active = False
    db.commit()
