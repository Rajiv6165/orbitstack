"""Unit tests for catalog-service product endpoints."""

PRODUCT_PAYLOAD = {
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "stock": 100,
    "sku": "MOUSE-001",
}


def test_create_product(client):
    response = client.post("/products/", json=PRODUCT_PAYLOAD)
    assert response.status_code == 201
    body = response.json()
    assert body["sku"] == "MOUSE-001"
    assert body["stock"] == 100
    assert body["id"] is not None


def test_create_product_duplicate_sku_returns_400(client):
    client.post("/products/", json=PRODUCT_PAYLOAD)
    response = client.post("/products/", json=PRODUCT_PAYLOAD)
    assert response.status_code == 400


def test_list_products_empty(client):
    response = client.get("/products/")
    assert response.status_code == 200
    assert response.json() == []


def test_list_products_returns_created_items(client):
    client.post("/products/", json=PRODUCT_PAYLOAD)
    response = client.get("/products/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_product_by_id(client):
    created = client.post("/products/", json=PRODUCT_PAYLOAD).json()
    response = client.get(f"/products/{created['id']}")
    assert response.status_code == 200
    assert response.json()["sku"] == "MOUSE-001"


def test_get_nonexistent_product_returns_404(client):
    response = client.get("/products/99999")
    assert response.status_code == 404


def test_adjust_stock_decrement(client):
    created = client.post("/products/", json=PRODUCT_PAYLOAD).json()
    response = client.patch(f"/products/{created['id']}/stock", json={"quantity": -10})
    assert response.status_code == 200
    assert response.json()["stock"] == 90


def test_adjust_stock_restock(client):
    created = client.post("/products/", json=PRODUCT_PAYLOAD).json()
    response = client.patch(f"/products/{created['id']}/stock", json={"quantity": 50})
    assert response.status_code == 200
    assert response.json()["stock"] == 150


def test_adjust_stock_below_zero_returns_400(client):
    created = client.post("/products/", json=PRODUCT_PAYLOAD).json()
    response = client.patch(f"/products/{created['id']}/stock", json={"quantity": -999})
    assert response.status_code == 400


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "catalog-service"
