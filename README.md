# OrbitStack 🚀

> A cloud-native, production-ready microservices e-commerce backend built with FastAPI, PostgreSQL, Redis, Docker, and Prometheus.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT / API GATEWAY                               │
└──────────────┬───────────────────┬────────────────────┬──────────────────────┘
               │                   │                    │
        ┌──────▼──────┐   ┌────────▼───────┐   ┌──────▼──────┐
        │ auth-service│   │catalog-service │   │order-service│
        │  :8001      │   │    :8002       │   │   :8003     │
        │─────────────│   │────────────────│   │─────────────│
        │ POST /auth/ │   │ POST /products/│   │ POST /orders│
        │   register  │   │ GET  /products/│   │  (validates │
        │ POST /auth/ │   │ GET  /products/│   │   JWT via   │
        │   login     │   │   {id}         │   │auth-service,│
        │ POST /auth/ │   │ PATCH /products│   │checks stock │
        │   validate  │   │   /{id}/stock  │   │via catalog, │
        └──────┬──────┘   └────────┬───────┘   │publishes    │
               │                   │            │ Redis event)│
        ┌──────▼──────┐   ┌────────▼───────┐   └──────┬──────┘
        │  PostgreSQL │   │  PostgreSQL    │          │
        │  (auth_db)  │   │ (catalog_db)   │          │
        └─────────────┘   └────────────────┘   ┌──────▼──────┐
                                                │  PostgreSQL │
                                                │  (order_db) │
                                                └──────┬──────┘
                                                       │
                                              ┌────────▼────────┐
                                              │      Redis      │
                                              │  pub/sub channel│
                                              │  order.created  │
                                              └────────┬────────┘
                                                       │
                                         ┌─────────────▼────────────┐
                                         │  notification-service    │
                                         │         :8004            │
                                         │  Subscribes to Redis,    │
                                         │  logs mock email per     │
                                         │  order.created event     │
                                         └──────────────────────────┘
```

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| `auth-service` | 8001 | JWT issuing (HS256), bcrypt password hashing, user management |
| `catalog-service` | 8002 | Product & inventory CRUD, stock management |
| `order-service` | 8003 | Places orders: validates JWT → checks stock → persists order → publishes event |
| `notification-service` | 8004 | Subscribes to `order.created` Redis channel, logs mock email notifications |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| API Framework | FastAPI 0.111 |
| ORM | SQLModel (SQLAlchemy + Pydantic) |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Auth | python-jose (JWT) + passlib/bcrypt |
| Messaging | Redis 7 pub/sub |
| Observability | prometheus-fastapi-instrumentator |
| Testing | pytest + pytest-asyncio + httpx |
| Containerisation | Docker (multi-stage) + Docker Compose v3.9 |

---

## Project Structure

```
OrbitStack/
├── docker-compose.yml          # Full stack orchestration
├── scripts/
│   └── init-db.sql             # Creates auth_db, catalog_db, order_db on first boot
├── README.md
└── services/
    ├── auth-service/
    │   ├── Dockerfile           # Multi-stage build
    │   ├── requirements.txt
    │   ├── alembic.ini
    │   ├── alembic/
    │   │   ├── env.py
    │   │   ├── script.py.mako
    │   │   └── versions/
    │   │       └── 001_initial.py
    │   ├── app/
    │   │   ├── main.py          # FastAPI app entry point
    │   │   ├── db/session.py    # Engine + session dependency
    │   │   ├── models/user.py   # SQLModel entity
    │   │   ├── schemas/auth.py  # Pydantic request/response schemas
    │   │   ├── routers/auth.py  # HTTP route handlers
    │   │   └── services/auth_service.py  # Business logic
    │   └── tests/
    │       ├── conftest.py
    │       └── test_auth.py
    ├── catalog-service/         # Same clean-arch layout
    │   └── ...
    ├── order-service/           # Same + Redis publish
    │   └── ...
    └── notification-service/   # No DB; asyncio Redis subscriber
        └── ...
```

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose)

### Run the Full Stack

```bash
# Clone / enter the project
cd OrbitStack

# Build images and start all services
docker-compose up --build

# (Background mode)
docker-compose up --build -d
```

### Verify all services are healthy

```bash
curl http://localhost:8001/health   # auth-service
curl http://localhost:8002/health   # catalog-service
curl http://localhost:8003/health   # order-service
curl http://localhost:8004/health   # notification-service
```

### End-to-End Walkthrough

```bash
# 1. Register a user
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "strongpass"}'
# → {"access_token": "<JWT>", "token_type": "bearer"}

# 2. Create a product (via catalog-service)
curl -X POST http://localhost:8002/products/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "sku": "LAPTOP-001", "price": 999.99, "stock": 50}'

# 3. Place an order (via order-service) — include JWT from step 1
curl -X POST http://localhost:8003/orders/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"product_id": 1, "quantity": 2}'
# → Notification service logs a mock email to stdout
```

---

## Prometheus Metrics

Every service exposes `/metrics` in Prometheus format:

```
http://localhost:8001/metrics   # auth-service
http://localhost:8002/metrics   # catalog-service
http://localhost:8003/metrics   # order-service
http://localhost:8004/metrics   # notification-service
```

---

## Running Tests Locally

Tests run without Docker using SQLite in-memory. Cross-service HTTP calls and Redis are mocked.

```bash
# Install dependencies (example for auth-service)
cd services/auth-service
pip install -r requirements.txt

# Run tests
pytest tests/ -v

# Run all services' tests from root (PowerShell)
foreach ($svc in @("auth-service","catalog-service","order-service","notification-service")) {
  Write-Host "=== $svc ===" -ForegroundColor Cyan
  Push-Location "services/$svc"
  pytest tests/ -v
  Pop-Location
}
```

---

## Environment Variables Reference

### auth-service
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./auth.db` | PostgreSQL connection string |
| `SECRET_KEY` | `changeme-in-production` | JWT signing secret — **change this!** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token TTL in minutes |

### catalog-service
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./catalog.db` | PostgreSQL connection string |

### order-service
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./order.db` | PostgreSQL connection string |
| `AUTH_SERVICE_URL` | `http://auth-service:8000` | Internal URL of auth-service |
| `CATALOG_SERVICE_URL` | `http://catalog-service:8000` | Internal URL of catalog-service |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |

### notification-service
| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |

---

## API Reference

Each service auto-generates interactive API docs:

| Service | Swagger UI | ReDoc |
|---------|-----------|-------|
| auth | http://localhost:8001/docs | http://localhost:8001/redoc |
| catalog | http://localhost:8002/docs | http://localhost:8002/redoc |
| order | http://localhost:8003/docs | http://localhost:8003/redoc |
| notification | http://localhost:8004/docs | http://localhost:8004/redoc |

---

## Production Notes

> [!CAUTION]
> Before deploying, rotate `SECRET_KEY` in `docker-compose.yml` (or inject via a secrets manager such as AWS Secrets Manager / HashiCorp Vault).

- **Database isolation**: Each service owns its own PostgreSQL database (`auth_db`, `catalog_db`, `order_db`). Never share tables between services.
- **Redis events are best-effort**: If Redis is unavailable when an order is placed, the order is still persisted. The notification subscriber will reconnect automatically with exponential back-off.
- **Auth tokens expire** after 60 minutes by default — configure `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Add an API Gateway** (Traefik, Kong, or AWS API GW) in front of all services in production to handle routing, rate limiting, and TLS termination.

---

## License

MIT
