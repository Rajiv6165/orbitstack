import os
import time
import pytest
import httpx

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://localhost:8002")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:8003")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8004")


@pytest.fixture(scope="session")
def service_urls():
    """Return dictionary of base URLs for all backend services."""
    return {
        "auth": AUTH_SERVICE_URL,
        "catalog": CATALOG_SERVICE_URL,
        "order": ORDER_SERVICE_URL,
        "notification": NOTIFICATION_SERVICE_URL,
    }


@pytest.fixture(scope="session", autouse=True)
def wait_for_services(service_urls):
    """Ensure all backend microservices are healthy before running tests."""
    client = httpx.Client(timeout=5.0)
    for service_name, url in service_urls.items():
        health_url = f"{url}/health"
        connected = False
        start_time = time.time()
        while time.time() - start_time < 30:
            try:
                res = client.get(health_url)
                if res.status_code == 200:
                    connected = True
                    break
            except httpx.RequestError:
                pass
            time.sleep(1)

        if not connected:
            pytest.fail(f"Service {service_name} at {health_url} failed to become healthy within 30 seconds.")
