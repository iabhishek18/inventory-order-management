def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert "name" in body and "version" in body


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_openapi(client):
    r = client.get("/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    assert "/api/v1/products" in spec["paths"]
    assert "/api/v1/customers" in spec["paths"]
    assert "/api/v1/orders" in spec["paths"]
    assert "/api/v1/dashboard" in spec["paths"]
