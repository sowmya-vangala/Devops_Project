"""Authentication tests."""

def test_signup_success(client):
    r = client.post("/api/auth/signup", json={"username":"newuser","email":"new@test.com","password":"pass123"})
    assert r.status_code == 201

def test_signup_duplicate(client, test_user):
    r = client.post("/api/auth/signup", json={"username":"testuser","email":"x@test.com","password":"pass123"})
    assert r.status_code == 400

def test_signup_invalid_email(client):
    r = client.post("/api/auth/signup", json={"username":"newuser","email":"bad","password":"pass123"})
    assert r.status_code == 422

def test_signup_short_password(client):
    r = client.post("/api/auth/signup", json={"username":"newuser","email":"x@test.com","password":"12"})
    assert r.status_code == 422

def test_login_success(client, test_user):
    r = client.post("/api/auth/login", json={"username":"testuser","password":"password123"})
    assert r.status_code == 200
    assert "token" in r.json()
    assert r.json()["role"] == "PATIENT"

def test_login_wrong_password(client, test_user):
    r = client.post("/api/auth/login", json={"username":"testuser","password":"wrongpass123"})
    assert r.status_code == 401

def test_login_nonexistent(client):
    r = client.post("/api/auth/login", json={"username":"ghost","password":"pass123"})
    assert r.status_code == 401
