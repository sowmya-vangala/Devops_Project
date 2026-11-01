"""Appointment CRUD tests."""

def test_create_appointment(client, auth_headers, test_provider):
    r = client.post("/api/appointments", json={
        "appointmentDate":"2026-05-01","appointmentTime":"10:00",
        "reason":"Check-up","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["reason"] == "Check-up"

def test_get_appointments(client, auth_headers):
    r = client.get("/api/appointments", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_get_appointment_by_id(client, auth_headers, test_provider):
    cr = client.post("/api/appointments", json={
        "appointmentDate":"2026-05-02","appointmentTime":"11:00",
        "reason":"Follow-up","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    appt_id = cr.json()["id"]
    r = client.get(f"/api/appointments/{appt_id}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["reason"] == "Follow-up"

def test_update_appointment(client, auth_headers, test_provider):
    cr = client.post("/api/appointments", json={
        "appointmentDate":"2026-05-03","appointmentTime":"09:00",
        "reason":"Old reason","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    appt_id = cr.json()["id"]
    r = client.put(f"/api/appointments/{appt_id}", json={
        "appointmentDate":"2026-05-04","appointmentTime":"10:00",
        "reason":"New reason","notes":"Updated","providerId":test_provider.id
    }, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["reason"] == "New reason"

def test_delete_appointment(client, auth_headers, test_provider):
    cr = client.post("/api/appointments", json={
        "appointmentDate":"2026-05-05","appointmentTime":"14:00",
        "reason":"Delete me","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    appt_id = cr.json()["id"]
    r = client.delete(f"/api/appointments/{appt_id}", headers=auth_headers)
    assert r.status_code == 204
    r2 = client.get(f"/api/appointments/{appt_id}", headers=auth_headers)
    assert r2.status_code == 404

def test_conflict_same_provider_same_time(client, auth_headers, test_provider):
    """Same provider, same date/time should be rejected."""
    client.post("/api/appointments", json={
        "appointmentDate":"2026-06-01","appointmentTime":"10:00",
        "reason":"First","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    r = client.post("/api/appointments", json={
        "appointmentDate":"2026-06-01","appointmentTime":"10:00",
        "reason":"Second","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    assert r.status_code == 409

def test_conflict_same_provider_within_45_min(client, auth_headers, test_provider):
    """Same provider, same date, within 45 min gap should be rejected."""
    client.post("/api/appointments", json={
        "appointmentDate":"2026-06-02","appointmentTime":"10:00",
        "reason":"First","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    r = client.post("/api/appointments", json={
        "appointmentDate":"2026-06-02","appointmentTime":"10:30",
        "reason":"Too close","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    assert r.status_code == 409

def test_conflict_same_user_same_time(client, auth_headers, test_provider, db):
    """Same user, same date/time with different provider should be rejected."""
    from app.models import ServiceProvider
    p2 = ServiceProvider(name="Dr. Other", specialization="Other",
                         email="other@test.com", phone="+353-1-222-2222")
    db.add(p2)
    db.commit()
    db.refresh(p2)
    client.post("/api/appointments", json={
        "appointmentDate":"2026-06-03","appointmentTime":"10:00",
        "reason":"With provider 1","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    r = client.post("/api/appointments", json={
        "appointmentDate":"2026-06-03","appointmentTime":"10:00",
        "reason":"With provider 2","notes":"","providerId":p2.id
    }, headers=auth_headers)
    assert r.status_code == 409

def test_no_conflict_45_min_apart(client, auth_headers, test_provider):
    """Same provider, 45+ min apart should be allowed."""
    client.post("/api/appointments", json={
        "appointmentDate":"2026-06-04","appointmentTime":"10:00",
        "reason":"First","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    r = client.post("/api/appointments", json={
        "appointmentDate":"2026-06-04","appointmentTime":"10:45",
        "reason":"Second OK","notes":"","providerId":test_provider.id
    }, headers=auth_headers)
    assert r.status_code == 201

def test_appointment_not_found(client, auth_headers):
    r = client.get("/api/appointments/99999", headers=auth_headers)
    assert r.status_code == 404

def test_requires_auth(client):
    r = client.get("/api/appointments")
    assert r.status_code in [401, 403]
