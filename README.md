# OrbitStack 🚀

> A cloud-native, production-ready microservices e-commerce platform built with FastAPI, PostgreSQL, Redis, React 18, Vite, Three.js, Docker, and Kubernetes.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INGRESS / CLIENT GATEWAY                              │
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

## Kubernetes Deployment (Minikube / Production)

OrbitStack includes production-grade Kubernetes manifests in `/k8s` for all 5 services (4 backend + 1 frontend) with:
- **Zero-downtime rolling deploys**: `readinessProbe` and `livenessProbe` on `/health`
- **Auto-scaling**: `HorizontalPodAutoscaler` for `catalog-service` (CPU-based, 2-10 replicas)
- **Ingress routing**: Single NGINX Ingress controller routing `/api/auth`, `/api/catalog`, `/api/orders`, `/api/notification` (and `/api/notify`), and `/` to the frontend.
- **Config & Secret Isolation**: Templated secret configuration with isolated namespace `orbitstack`.

### 1. Prerequisites
- `minikube` installed (`brew install minikube` or `choco install minikube`)
- `kubectl` CLI installed

### 2. Enable Minikube Addons

```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
minikube addons enable metrics-server
```

### 3. Single-Command Deploy

To deploy the entire platform (namespace, configs, secrets, databases, services, HPA, and ingress) with a single command:

```bash
# Point shell to Minikube's Docker daemon to build images locally
eval $(minikube docker-env)

# Build all local microservice and frontend images
docker build -t orbitstack/auth-service:latest ./services/auth-service
docker build -t orbitstack/catalog-service:latest ./services/catalog-service
docker build -t orbitstack/order-service:latest ./services/order-service
docker build -t orbitstack/notification-service:latest ./services/notification-service
docker build -t orbitstack/frontend:latest ./frontend

# Apply all manifests recursively into the `orbitstack` namespace
kubectl apply -f k8s/ -R
```

### 4. Verify Deployments & Health Probes

```bash
# Watch pods initialize in the orbitstack namespace
kubectl get pods -n orbitstack -w

# Check Horizontal Pod Autoscaler status
kubectl get hpa -n orbitstack

# Check Ingress rules and IP
kubectl get ingress -n orbitstack
```

### 5. Access the Ingress Gateway

```bash
# Open minikube tunnel or get IP
minikube tunnel

# Or add minikube IP to /etc/hosts:
echo "$(minikube ip) orbitstack.local" | sudo tee -a /etc/hosts
```

Browse to `http://orbitstack.local` or `http://$(minikube ip)/` to view the frontend, and API endpoints at `http://orbitstack.local/api/catalog/products/`.

---

## Services Overview

| Service | Port | Description | Health Endpoint |
|---------|------|-------------|-----------------|
| `auth-service` | 8001 | JWT issuing (HS256), bcrypt password hashing | `/health` |
| `catalog-service` | 8002 | Product & inventory CRUD, stock management | `/health` |
| `order-service` | 8003 | Places orders: validates JWT → checks stock → persists → publishes event | `/health` |
| `notification-service` | 8004 | Subscribes to `order.created` Redis channel, logs email | `/health` |
| `frontend` | 3000 / 80 | React 18 + Vite + Three.js Storefront & Mission Control | `/health` |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 8, Tailwind CSS v4, Three.js (R3F), Framer Motion |
| API Framework | FastAPI 0.111 |
| ORM | SQLModel (SQLAlchemy + Pydantic) |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Auth | python-jose (JWT) + passlib/bcrypt |
| Messaging | Redis 7 pub/sub |
| Observability | prometheus-fastapi-instrumentator |
| Orchestration | Docker Compose v3.9 + Kubernetes (k8s) Manifests |

---

## Local Development (Docker Compose)

```bash
# Start all microservices, databases, and frontend
docker-compose up --build

# Open frontend in browser
open http://localhost:3000  # or dev server http://localhost:5173
```

---

## Running Tests Locally

```bash
# Run tests for all services (PowerShell)
foreach ($svc in @("auth-service","catalog-service","order-service","notification-service")) {
  Write-Host "=== $svc ===" -ForegroundColor Cyan
  Push-Location "services/$svc"
  pytest tests/ -v
  Pop-Location
}
```

---

## License

MIT
