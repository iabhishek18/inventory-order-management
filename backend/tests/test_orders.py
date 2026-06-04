from decimal import Decimal


def _setup(client, auth_headers):
    p1 = client.post(
        "/api/v1/products",
        json={"name": "Pen", "sku": "PEN-1", "price": "2.50", "quantity_in_stock": 10},
        headers=auth_headers,
    ).json()
    p2 = client.post(
        "/api/v1/products",
        json={"name": "Pad", "sku": "PAD-1", "price": "4.25", "quantity_in_stock": 4},
        headers=auth_headers,
    ).json()
    c = client.post(
        "/api/v1/customers",
        json={"full_name": "Buyer", "email": "buyer@example.com", "phone": "+1-555-1212"},
        headers=auth_headers,
    ).json()
    return p1, p2, c


def test_create_order_decrements_stock_and_calculates_total(client, auth_headers):
    p1, p2, c = _setup(client, auth_headers)
    r = client.post(
        "/api/v1/orders",
        json={
            "customer_id": c["id"],
            "items": [
                {"product_id": p1["id"], "quantity": 3},
                {"product_id": p2["id"], "quantity": 2},
            ],
        },
        headers=auth_headers,
    )
    assert r.status_code == 201, r.text
    body = r.json()
    expected = Decimal("2.50") * 3 + Decimal("4.25") * 2
    assert Decimal(body["total_amount"]) == expected
    assert body["status"] == "confirmed"
    assert len(body["items"]) == 2

    p1_after = client.get(f"/api/v1/products/{p1['id']}", headers=auth_headers).json()
    p2_after = client.get(f"/api/v1/products/{p2['id']}", headers=auth_headers).json()
    assert p1_after["quantity_in_stock"] == 7
    assert p2_after["quantity_in_stock"] == 2


def test_insufficient_stock_blocks_order(client, auth_headers):
    p1, _, c = _setup(client, auth_headers)
    r = client.post(
        "/api/v1/orders",
        json={
            "customer_id": c["id"],
            "items": [{"product_id": p1["id"], "quantity": 9999}],
        },
        headers=auth_headers,
    )
    assert r.status_code == 409
    p1_after = client.get(f"/api/v1/products/{p1['id']}", headers=auth_headers).json()
    assert p1_after["quantity_in_stock"] == 10


def test_total_ignores_client_supplied_value(client, auth_headers):
    p1, _, c = _setup(client, auth_headers)
    r = client.post(
        "/api/v1/orders",
        json={
            "customer_id": c["id"],
            "items": [{"product_id": p1["id"], "quantity": 1}],
            "total_amount": "9999.00",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    assert Decimal(r.json()["total_amount"]) == Decimal("2.50")


def test_cancel_order_restores_stock(client, auth_headers):
    p1, _, c = _setup(client, auth_headers)
    created = client.post(
        "/api/v1/orders",
        json={"customer_id": c["id"], "items": [{"product_id": p1["id"], "quantity": 4}]},
        headers=auth_headers,
    )
    oid = created.json()["id"]
    assert client.get(f"/api/v1/products/{p1['id']}", headers=auth_headers).json()["quantity_in_stock"] == 6

    cancel = client.delete(f"/api/v1/orders/{oid}", headers=auth_headers)
    assert cancel.status_code == 204

    after = client.get(f"/api/v1/products/{p1['id']}", headers=auth_headers).json()
    assert after["quantity_in_stock"] == 10


def test_order_with_missing_customer(client, auth_headers):
    p1, _, _ = _setup(client, auth_headers)
    r = client.post(
        "/api/v1/orders",
        json={"customer_id": 9999, "items": [{"product_id": p1["id"], "quantity": 1}]},
        headers=auth_headers,
    )
    assert r.status_code == 404


def test_order_with_missing_product(client, auth_headers):
    _, _, c = _setup(client, auth_headers)
    r = client.post(
        "/api/v1/orders",
        json={"customer_id": c["id"], "items": [{"product_id": 9999, "quantity": 1}]},
        headers=auth_headers,
    )
    assert r.status_code == 404


def test_list_and_get_orders(client, auth_headers):
    p1, _, c = _setup(client, auth_headers)
    client.post(
        "/api/v1/orders",
        json={"customer_id": c["id"], "items": [{"product_id": p1["id"], "quantity": 1}]},
        headers=auth_headers,
    )
    lst = client.get("/api/v1/orders", headers=auth_headers)
    assert lst.status_code == 200
    assert len(lst.json()) == 1
    oid = lst.json()[0]["id"]
    detail = client.get(f"/api/v1/orders/{oid}", headers=auth_headers)
    assert detail.status_code == 200
    assert detail.json()["items"][0]["product_sku"] == "PEN-1"
