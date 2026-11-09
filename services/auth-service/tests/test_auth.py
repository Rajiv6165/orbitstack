"""Unit tests for auth-service endpoints."""


def test_register_creates_user_and_returns_token(client):
    response = client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "securepass"},
    )
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_register_duplicate_email_is_rejected(client):
    payload = {"email": "dup@example.com", "password": "pass"}
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "registered" in response.json()["detail"].lower()


def test_login_with_correct_credentials(client):
    client.post("/auth/register", json={"email": "bob@example.com", "password": "mypass"})
    response = client.post(
        "/auth/login",
        json={"email": "bob@example.com", "password": "mypass"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_returns_401(client):
    client.post("/auth/register", json={"email": "carol@example.com", "password": "correct"})
    response = client.post(
        "/auth/login",
        json={"email": "carol@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user_returns_401(client):
    response = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "irrelevant"},
    )
    assert response.status_code == 401


def test_validate_valid_token(client):
    reg = client.post(
        "/auth/register",
        json={"email": "dan@example.com", "password": "pass"},
    )
    token = reg.json()["access_token"]
    response = client.post("/auth/validate", json={"token": token})
    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["email"] == "dan@example.com"


def test_validate_invalid_token_returns_false(client):
    response = client.post("/auth/validate", json={"token": "totally.invalid.jwt"})
    assert response.status_code == 200
    assert response.json()["valid"] is False


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "auth-service"


def test_register_password_longer_than_72_bytes_returns_422(client):
    overlong_password = "a" * 73
    response = client.post(
        "/auth/register",
        json={"email": "toolong@example.com", "password": overlong_password},
    )
    assert response.status_code == 422


def test_login_password_longer_than_72_bytes_returns_422(client):
    overlong_password = "a" * 73
    response = client.post(
        "/auth/login",
        json={"email": "toolong@example.com", "password": overlong_password},
    )
    assert response.status_code == 422


def test_verify_password_verifies_existing_2b_hash():
    from app.services.auth_service import verify_password
    # Pre-computed standard $2b$ bcrypt hash for "SecurePass123!"
    existing_hash = "$2b$12$4vj6l.7O8b23fXy5j2iR9e6dKqE.n6b2oF5R6iL9i3L1k9p4o7Q8W"
    # Or generate a real $2b$ hash directly
    import bcrypt
    sample_hash = bcrypt.hashpw(b"legacy-pass", bcrypt.gensalt(prefix=b"2b")).decode("utf-8")
    assert verify_password("legacy-pass", sample_hash) is True
    assert verify_password("wrong-pass", sample_hash) is False
