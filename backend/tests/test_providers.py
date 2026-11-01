"""Service Provider tests."""

def test_list_providers(client, auth_headers, test_provider):
    r = client.get("/api/providers", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1

def test_get_provider(client, auth_headers, test_provider):
    r = client.get(f"/api/providers/{test_provider.id}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["name"] == "Dr. Test"

def test_create_provider_admin(client, admin_headers):
    r = client.post("/api/providers", json={
        "name":"Dr. New","specialization":"Surgery",
        "email":"new@clinic.com","phone":"+353-1-999-9999",
        "availableFrom":"09:00","availableTo":"17:00"
    }, headers=admin_headers)
    assert r.status_code == 201

def test_create_provider_patient_forbidden(client, auth_headers):
    r = client.post("/api/providers", json={
        "name":"Dr. Fail","specialization":"None",
        "email":"fail@test.com","phone":"+353-1-000-0000",
        "availableFrom":"09:00","availableTo":"17:00"
    }, headers=auth_headers)
    assert r.status_code == 403

def test_update_provider_admin(client, admin_headers, test_provider):
    r = client.put(f"/api/providers/{test_provider.id}", json={
        "name":"Dr. Updated","specialization":"Updated",
        "email":"up@test.com","phone":"+353-1-222-2222",
        "availableFrom":"08:00","availableTo":"16:00"
    }, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["name"] == "Dr. Updated"

def test_delete_provider_soft(client, admin_headers, test_provider):
    r = client.delete(f"/api/providers/{test_provider.id}", headers=admin_headers)
    assert r.status_code == 204

def test_provider_not_found(client, auth_headers):
    r = client.get("/api/providers/99999", headers=auth_headers)
    assert r.status_code == 404

def test_requires_auth(client):
    r = client.get("/api/providers")
    assert r.status_code in [401, 403]
