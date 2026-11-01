"""Test fixtures for the Appointment Booking System."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from app.auth import hash_password, create_access_token
from app.models import User, UserRole, ServiceProvider

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    user = User(username="testuser", email="test@test.com",
                password_hash=hash_password("password123"), role=UserRole.PATIENT)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db):
    user = User(username="admin", email="admin@test.com",
                password_hash=hash_password("admin123"), role=UserRole.ADMIN)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(data={"sub": test_user.username, "role": "PATIENT"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin):
    token = create_access_token(data={"sub": test_admin.username, "role": "ADMIN"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_provider(db):
    p = ServiceProvider(name="Dr. Test", specialization="Testing",
                        email="dr@test.com", phone="+353-1-111-1111")
    db.add(p)
    db.commit()
    db.refresh(p)
    return p
