def test_dashboard_counts_and_low_stock(client, auth_headers):
    for i in range(3):
        client.post(
            "/api/v1/customers",
            json={
                "full_name": f"C{i}",
                "email": f"c{i}@example.com",
                "phone": "+1-555-0000",
            },
            headers=auth_headers,
        )
    client.post(
        "/api/v1/products",
        json={"name": "High", "sku": "H-1", "price": "1.00", "quantity_in_stock": 100},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/products",
        json={"name": "Low", "sku": "L-1", "price": "1.00", "quantity_in_stock": 2},
        headers=auth_headers,
    )

    r = client.get("/api/v1/dashboard", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["total_customers"] == 3
    assert body["total_products"] == 2
    assert body["total_orders"] == 0
    skus = [p["sku"] for p in body["low_stock_products"]]
    assert "L-1" in skus
    assert "H-1" not in skus
