import time
import uuid
import httpx
import pytest


def test_full_end_to_end_order_flow(service_urls):
    """
    Test the REAL end-to-end order processing flow across running microservice containers:
    1. Register a new user on auth-service
    2. Login to retrieve access token from auth-service
    3. Create a product on catalog-service
    4. Place an order on order-service with Bearer token
    5. Verify catalog-service product stock is decremented
    6. Verify notification-service receives the Redis pub/sub order.created event
    """
    auth_url = service_urls["auth"]
    catalog_url = service_urls["catalog"]
    order_url = service_urls["order"]
    notification_url = service_urls["notification"]

    client = httpx.Client(timeout=10.0)

    # Generate unique test user credentials
    unique_id = uuid.uuid4().hex[:8]
    test_email = f"e2e_user_{unique_id}@orbitstack.io"
    test_password = "SecureE2EPassword123!"

    # 1. Register User
    reg_payload = {"email": test_email, "password": test_password}
    reg_res = client.post(f"{auth_url}/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]

    # 2. Login User
    login_payload = {"email": test_email, "password": test_password}
    login_res = client.post(f"{auth_url}/auth/login", json=login_payload)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    assert login_data["access_token"] == token

    # 3. Create Product
    initial_stock = 100
    product_payload = {
        "name": f"Quantum Processor {unique_id}",
        "description": "Next-gen computing core",
        "price": 299.99,
        "stock": initial_stock,
    }
    prod_res = client.post(f"{catalog_url}/products/", json=product_payload)
    assert prod_res.status_code == 201, f"Create product failed: {prod_res.text}"
    product = prod_res.json()
    product_id = product["id"]
    assert product["stock"] == initial_stock

    # 4. Place Order
    order_quantity = 3
    order_payload = {
        "product_id": product_id,
        "quantity": order_quantity,
    }
    headers = {"Authorization": f"Bearer {token}"}
    order_res = client.post(f"{order_url}/orders/", json=order_payload, headers=headers)
    assert order_res.status_code == 201, f"Place order failed: {order_res.text}"
    order = order_res.json()
    order_id = order["id"]
    assert order["product_id"] == product_id
    assert order["quantity"] == order_quantity
    expected_total = round(299.99 * order_quantity, 2)
    assert abs(order["total_price"] - expected_total) < 0.01

    # 5. Verify Stock Decremented on catalog-service
    stock_res = client.get(f"{catalog_url}/products/{product_id}")
    assert stock_res.status_code == 200, f"Get product failed: {stock_res.text}"
    updated_product = stock_res.json()
    expected_stock = initial_stock - order_quantity
    assert updated_product["stock"] == expected_stock, (
        f"Expected stock to be {expected_stock}, but got {updated_product['stock']}"
    )

    # 6. Verify notification-service received the Redis pub/sub event
    event_received = False
    matching_notification = None

    start_wait = time.time()
    while time.time() - start_wait < 10:
        notif_res = client.get(f"{notification_url}/notifications")
        if notif_res.status_code == 200:
            notifications = notif_res.json().get("notifications", [])
            for event in notifications:
                if event.get("order_id") == order_id:
                    event_received = True
                    matching_notification = event
                    break
        if event_received:
            break
        time.sleep(0.5)

    assert event_received, f"Notification service did not receive Redis event for order_id {order_id}"
    assert matching_notification["customer_email"] == test_email
    assert matching_notification["product_id"] == product_id
    assert matching_notification["quantity"] == order_quantity
