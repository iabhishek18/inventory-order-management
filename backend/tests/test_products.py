def _new_product(client, auth_headers, **overrides):
    payload = {
        "name": "Widget",
        "sku": "WID-1",
        "description": "test",
        "price": "12.50",
        "quantity_in_stock": 5,
    }
    payload.update(overrides)
    return client.post("/api/v1/products", json=payload, headers=auth_headers)


def test_create_list_get_update_delete(client, auth_headers):
    r = _new_product(client, auth_headers)
    assert r.status_code == 201
    pid = r.json()["id"]

    lst = client.get("/api/v1/products", headers=auth_headers)
    assert lst.status_code == 200
    assert len(lst.json()) == 1

    got = client.get(f"/api/v1/products/{pid}", headers=auth_headers)
    assert got.status_code == 200
    assert got.json()["sku"] == "WID-1"

    upd = client.put(
        f"/api/v1/products/{pid}",
        json={"price": "15.00", "quantity_in_stock": 10},
        headers=auth_headers,
    )
    assert upd.status_code == 200
    assert upd.json()["price"] == "15.00"
    assert upd.json()["quantity_in_stock"] == 10

    dele = client.delete(f"/api/v1/products/{pid}", headers=auth_headers)
    assert dele.status_code == 204
    missing = client.get(f"/api/v1/products/{pid}", headers=auth_headers)
    assert missing.status_code == 404


def test_sku_unique(client, auth_headers):
    r1 = _new_product(client, auth_headers, sku="DUP-1")
    assert r1.status_code == 201
    r2 = _new_product(client, auth_headers, sku="DUP-1", name="Other")
    assert r2.status_code == 409


def test_negative_quantity_rejected(client, auth_headers):
    r = _new_product(client, auth_headers, quantity_in_stock=-1)
    assert r.status_code == 422


def test_negative_price_rejected(client, auth_headers):
    r = _new_product(client, auth_headers, price="-1.00")
    assert r.status_code == 422


def test_update_to_existing_sku_conflicts(client, auth_headers):
    a = _new_product(client, auth_headers, sku="A-1")
    b = _new_product(client, auth_headers, sku="B-1", name="B")
    assert a.status_code == 201 and b.status_code == 201
    r = client.put(
        f"/api/v1/products/{b.json()['id']}",
        json={"sku": "A-1"},
        headers=auth_headers,
    )
    assert r.status_code == 409
