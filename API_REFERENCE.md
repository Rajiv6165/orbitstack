# OrbitStack API Reference & OpenAPI Documentation

OrbitStack provides auto-generated, interactive **OpenAPI 3.0 / Swagger UI** documentation for all microservices.

---

## 📚 Service OpenAPI Documentation Endpoints

When running locally (via `docker-compose` or `docker-compose.test.yml`), access the live Swagger UI interactive documentation at the following URLs:

| Service | Port | Local Swagger Docs URL | Ingress Gateway Path | Description |
|---------|------|------------------------|----------------------|-------------|
| **Auth Service** | `8001` | [http://localhost:8001/docs](http://localhost:8001/docs) | `/api/auth/docs` | User registration, login, bcrypt password hashing, and JWT issuance & validation. |
| **Catalog Service** | `8002` | [http://localhost:8002/docs](http://localhost:8002/docs) | `/api/catalog/docs` | Product catalog CRUD, item metadata, and stock inventory levels. |
| **Order Service** | `8003` | [http://localhost:8003/docs](http://localhost:8003/docs) | `/api/orders/docs` | Inter-service order placement, stock reservation, and Redis event publishing. |
| **Notification Service** | `8004` | [http://localhost:8004/docs](http://localhost:8004/docs) | `/api/notification/docs` | Redis Pub/Sub subscriber listener and notification history. |

---

## 🛡️ Ingress Rate Limiting Summary

All API traffic entering through the **NGINX Ingress Gateway** is subject to IP-based rate limiting (`nginx.ingress.kubernetes.io/limit-rpm`):

- **Brute-Force Auth Protection**: **100 requests/minute per IP** on `/api/auth/login` and `/api/auth/register`.
- **General API Limits**: **300 requests/minute per IP** on all other `/api/*` routes.

---

## 🚀 cURL Examples for Major Endpoints

### 1. Register a New Account (`POST /api/auth/register`)

Registers a new user in `auth_db`, hashes the password with bcrypt, and returns an access token.

```bash
curl -X 'POST' \
  'http://localhost:8001/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@orbitstack.io",
  "password": "SecurePassword123!"
}'
```

**Response (`201 Created`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ...",
  "token_type": "bearer"
}
```

---

### 2. Authenticate & Login (`POST /api/auth/login`)

Verifies email and password credentials, returning a signed JWT access token.

```bash
curl -X 'POST' \
  'http://localhost:8001/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@orbitstack.io",
  "password": "SecurePassword123!"
}'
```

**Response (`200 OK`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ...",
  "token_type": "bearer"
}
```

---

### 3. Validate Access Token (`POST /api/auth/validate`)

Decodes and validates a JWT token. Called internally by `order-service`.

```bash
curl -X 'POST' \
  'http://localhost:8001/auth/validate' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ..."
}'
```

**Response (`200 OK`)**:
```json
{
  "valid": true,
  "email": "user@orbitstack.io"
}
```

---

### 4. Create Product (`POST /api/catalog/products/`)

Adds a new product to `catalog_db` with initial stock levels.

```bash
curl -X 'POST' \
  'http://localhost:8002/products/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Quantum Laptop Pro",
  "description": "High performance computing workstation",
  "price": 1499.99,
  "stock": 50,
  "sku": "LAP-Q1-001"
}'
```

**Response (`201 Created`)**:
```json
{
  "id": 1,
  "name": "Quantum Laptop Pro",
  "description": "High performance computing workstation",
  "price": 1499.99,
  "stock": 50,
  "sku": "LAP-Q1-001"
}
```

---

### 5. List All Products (`GET /api/catalog/products/`)

Retrieves available product listings and inventory stock.

```bash
curl -X 'GET' \
  'http://localhost:8002/products/' \
  -H 'accept: application/json'
```

**Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "name": "Quantum Laptop Pro",
    "description": "High performance computing workstation",
    "price": 1499.99,
    "stock": 50,
    "sku": "LAP-Q1-001"
  }
]
```

---

### 6. Adjust Product Stock (`PATCH /api/catalog/products/{product_id}/stock`)

Adjusts product stock levels. Negative numbers decrement stock (called internally by `order-service`).

```bash
curl -X 'PATCH' \
  'http://localhost:8002/products/1/stock' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "quantity": -2
}'
```

**Response (`200 OK`)**:
```json
{
  "id": 1,
  "name": "Quantum Laptop Pro",
  "description": "High performance computing workstation",
  "price": 1499.99,
  "stock": 48,
  "sku": "LAP-Q1-001"
}
```

---

### 7. Place New Order (`POST /api/orders/`)

Executes full order placement workflow using JWT Bearer token authentication.

```bash
curl -X 'POST' \
  'http://localhost:8003/orders/' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ...' \
  -H 'Content-Type: application/json' \
  -d '{
  "product_id": 1,
  "quantity": 2
}'
```

**Response (`201 Created`)**:
```json
{
  "id": 101,
  "product_id": 1,
  "quantity": 2,
  "customer_email": "user@orbitstack.io",
  "status": "confirmed",
  "total_price": 2999.98,
  "created_at": "2026-07-25T23:00:00Z"
}
```

---

### 8. Get Order by ID (`GET /api/orders/{order_id}`)

Fetches order details by order ID.

```bash
curl -X 'GET' \
  'http://localhost:8003/orders/101' \
  -H 'accept: application/json'
```

**Response (`200 OK`)**:
```json
{
  "id": 101,
  "product_id": 1,
  "quantity": 2,
  "customer_email": "user@orbitstack.io",
  "status": "confirmed",
  "total_price": 2999.98,
  "created_at": "2026-07-25T23:00:00Z"
}
```

---

### 9. Get Received Event Notifications (`GET /api/notification/notifications`)

Retrieves events received asynchronously over Redis Pub/Sub.

```bash
curl -X 'GET' \
  'http://localhost:8004/notifications' \
  -H 'accept: application/json'
```

**Response (`200 OK`)**:
```json
{
  "notifications": [
    {
      "order_id": 101,
      "customer_email": "user@orbitstack.io",
      "product_id": 1,
      "product_name": "Quantum Laptop Pro",
      "quantity": 2,
      "total_price": 2999.98
    }
  ]
}
```

---

## ❌ Common Error Response Schemas

### 400 Bad Request
Returned when business logic constraints fail (e.g. duplicate registration email or insufficient product inventory):
```json
{
  "detail": "Email is already registered."
}
```

### 401 Unauthorized
Returned when invalid credentials or expired/missing JWT tokens are supplied:
```json
{
  "detail": "Invalid email or password."
}
```

### 404 Not Found
Returned when requesting a resource ID that does not exist:
```json
{
  "detail": "Product with ID 999 not found"
}
```

### 422 Unprocessable Entity (Validation Error)
Returned by FastAPI when request payload fails Pydantic schema validation:
```json
{
  "detail": [
    {
      "loc": ["body", "quantity"],
      "msg": "Input should be greater than or equal to 1",
      "type": "greater_than_equal"
    }
  ]
}
```
