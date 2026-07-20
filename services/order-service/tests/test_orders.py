"""
Unit tests for order-service.

Cross-service HTTP calls (auth-service, catalog-service) and Redis are fully
mocked so the tests run without any external infrastructure.
"""
import json
import pytest
import httpx
from unittest.mock import AsyncMock, MagicMock, patch

from tests.conftest import VALID_TOKEN, CUSTOMER_EMAIL


# ── Helpers ───────────────────────────────────────────────────────────────────

def _auth_ok_response():
    """Mock response: auth-service says token is valid."""
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
    mock.json.return_value = {"valid": True, "email": CUSTOMER_EMAIL}
    mock.raise_for_status = MagicMock()
    return mock


def _auth_invalid_response():
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
    mock.json.return_value = {"valid": False}
    mock.raise_for_status = MagicMock()
    return mock


def _product_ok_response(stock: int = 50, price: float = 10.0):
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
    mock.json.return_value = {
        "id": 1,
        "name": "Test Widget",
        "sku": "WIDGET-001",
        "price": price,
        "stock": stock,
        "description": None,
    }
    mock.raise_for_status = MagicMock()
    return mock


def _product_not_found_response():
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 404
    mock.raise_for_status = MagicMock()
    return mock


def _stock_adjust_response():
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
    mock.raise_for_status = MagicMock()
    return mock


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestPlaceOrder:
    def test_happy_path(self, client):
        """A valid order with sufficient stock should be created (status 201)."""
        with (
            patch(
                "app.services.order_service.httpx.AsyncClient",
                side_effect=[
                    _make_async_client(_auth_ok_response()),
                    _make_async_client(_product_ok_response()),
                    _make_async_client(_stock_adjust_response()),
                ],
            ),
            patch("app.services.order_service._get_redis") as mock_redis,
        ):
            mock_redis.return_value.publish = MagicMock()
            response = client.post(
                "/orders/",
                json={"product_id": 1, "quantity": 2},
                headers={"Authorization": f"Bearer {VALID_TOKEN}"},
            )

        assert response.status_code == 201
        body = response.json()
        assert body["customer_email"] == CUSTOMER_EMAIL
        assert body["quantity"] == 2
        assert body["status"] == "confirmed"
        assert body["total_price"] == pytest.approx(20.0)

    def test_invalid_token_returns_401(self, client):
        with patch(
            "app.services.order_service.httpx.AsyncClient",
            side_effect=[_make_async_client(_auth_invalid_response())],
        ):
            response = client.post(
                "/orders/",
                json={"product_id": 1, "quantity": 1},
                headers={"Authorization": f"Bearer bad.token"},
            )
        assert response.status_code == 401

    def test_missing_authorization_header_returns_422(self, client):
        response = client.post("/orders/", json={"product_id": 1, "quantity": 1})
        assert response.status_code == 422

    def test_product_not_found_returns_404(self, client):
        with patch(
            "app.services.order_service.httpx.AsyncClient",
            side_effect=[
                _make_async_client(_auth_ok_response()),
                _make_async_client(_product_not_found_response()),
            ],
        ):
            response = client.post(
                "/orders/",
                json={"product_id": 9999, "quantity": 1},
                headers={"Authorization": f"Bearer {VALID_TOKEN}"},
            )
        assert response.status_code == 404

    def test_insufficient_stock_returns_400(self, client):
        with patch(
            "app.services.order_service.httpx.AsyncClient",
            side_effect=[
                _make_async_client(_auth_ok_response()),
                _make_async_client(_product_ok_response(stock=1)),
            ],
        ):
            response = client.post(
                "/orders/",
                json={"product_id": 1, "quantity": 100},
                headers={"Authorization": f"Bearer {VALID_TOKEN}"},
            )
        assert response.status_code == 400


class TestGetOrder:
    def test_get_nonexistent_order_returns_404(self, client):
        response = client.get("/orders/99999")
        assert response.status_code == 404


class TestHealth:
    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["service"] == "order-service"


# ── Helper: build a context-manager-compatible AsyncClient mock ───────────────

class _AsyncClientContextManager:
    """Wraps a response mock so it can be used as `async with httpx.AsyncClient() as c`."""

    def __init__(self, response, method="post"):
        self._response = response
        self._method = method

    async def __aenter__(self):
        client = AsyncMock()
        client.post = AsyncMock(return_value=self._response)
        client.get = AsyncMock(return_value=self._response)
        client.patch = AsyncMock(return_value=self._response)
        return client

    async def __aexit__(self, *args):
        pass


def _make_async_client(response):
    return _AsyncClientContextManager(response)
