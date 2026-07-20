"""Unit tests for notification-service."""
import json
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.subscriber import _handle_event


class TestHandleEvent:
    @pytest.mark.asyncio
    async def test_valid_event_is_logged(self, caplog):
        import logging
        event = {
            "order_id": 42,
            "customer_email": "buyer@example.com",
            "product_id": 7,
            "product_name": "Widget Pro",
            "quantity": 3,
            "total_price": 89.97,
        }
        with caplog.at_level(logging.INFO, logger="notification-service.subscriber"):
            await _handle_event(json.dumps(event))

        assert "buyer@example.com" in caplog.text
        assert "42" in caplog.text

    @pytest.mark.asyncio
    async def test_invalid_json_does_not_raise(self, caplog):
        """Malformed events should be logged as errors but not crash the service."""
        import logging
        with caplog.at_level(logging.ERROR, logger="notification-service.subscriber"):
            await _handle_event("this is not json")
        assert "Failed to process" in caplog.text

    @pytest.mark.asyncio
    async def test_empty_event_does_not_raise(self):
        """An empty JSON object should be handled gracefully."""
        await _handle_event(json.dumps({}))


class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["service"] == "notification-service"
