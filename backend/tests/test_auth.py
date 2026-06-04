def test_register_login_me(client):
    r = client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.com", "full_name": "Alice", "password": "Secret123!"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "a@b.com"
    assert "hashed_password" not in body

    dup = client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.com", "full_name": "Alice 2", "password": "Secret123!"},
    )
    assert dup.status_code == 409

    login = client.post(
        "/api/v1/auth/login/json",
        json={"email": "a@b.com", "password": "Secret123!"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    assert token

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "a@b.com"


def test_login_invalid(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "u@x.com", "full_name": "U", "password": "Password1!"},
    )
    bad = client.post(
        "/api/v1/auth/login/json", json={"email": "u@x.com", "password": "wrong"}
    )
    assert bad.status_code == 401


def test_protected_requires_token(client):
    r = client.get("/api/v1/products")
    assert r.status_code == 401


def test_register_weak_password_rejected(client):
    r = client.post(
        "/api/v1/auth/register",
        json={"email": "w@x.com", "full_name": "W", "password": "short"},
    )
    assert r.status_code == 422
