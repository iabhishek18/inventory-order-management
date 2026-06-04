def _new_customer(client, auth_headers, **overrides):
    payload = {
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1-415-555-0100",
        "address": "1 Market St",
    }
    payload.update(overrides)
    return client.post("/api/v1/customers", json=payload, headers=auth_headers)


def test_create_list_get_delete(client, auth_headers):
    r = _new_customer(client, auth_headers)
    assert r.status_code == 201
    cid = r.json()["id"]

    lst = client.get("/api/v1/customers", headers=auth_headers)
    assert lst.status_code == 200 and len(lst.json()) == 1

    got = client.get(f"/api/v1/customers/{cid}", headers=auth_headers)
    assert got.status_code == 200

    dele = client.delete(f"/api/v1/customers/{cid}", headers=auth_headers)
    assert dele.status_code == 204


def test_email_unique(client, auth_headers):
    r1 = _new_customer(client, auth_headers, email="dup@example.com")
    assert r1.status_code == 201
    r2 = _new_customer(client, auth_headers, email="dup@example.com", full_name="Other")
    assert r2.status_code == 409


def test_invalid_email_rejected(client, auth_headers):
    r = _new_customer(client, auth_headers, email="not-an-email")
    assert r.status_code == 422
