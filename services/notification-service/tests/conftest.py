import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.fixture(name="client")
def client_fixture():
    """Start the app with the Redis subscriber mocked out."""
    with patch(
        "app.main.subscribe_and_listen",
        new_callable=lambda: lambda: AsyncMock(),
    ):
        from app.main import app
        with TestClient(app) as client:
            yield client
