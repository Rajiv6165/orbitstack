# OrbitStack 🚀

[![CI](https://github.com/Rajiv6165/orbitstack/actions/workflows/ci.yml/badge.svg)](https://github.com/Rajiv6165/orbitstack/actions/workflows/ci.yml)
[![Deploy](https://github.com/Rajiv6165/orbitstack/actions/workflows/deploy.yml/badge.svg)](https://github.com/Rajiv6165/orbitstack/actions/workflows/deploy.yml)

> A cloud-native, production-ready microservices e-commerce platform built with FastAPI, PostgreSQL, Redis, React 18, Vite, Three.js, Docker, Kubernetes, and Terraform.

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
        │ POST /auth/ │   │ POST /products/│   │ POST /products/│
        │   register  │   │ GET  /products/│   │   {id}      │
        │ POST /auth/ │   │ PATCH /products│   │ POST /orders│
        │   login     │   │   /{id}/stock  │   │             │
        └──────┬──────┘   └────────┬───────┘   └──────┬──────┘
               │                   │                  │
        ┌──────▼──────┐   ┌────────▼───────┐   ┌──────▼──────┐
        │  PostgreSQL │   │  PostgreSQL    │   │  PostgreSQL │
        │  (auth_db)  │   │ (catalog_db)   │   │  (order_db) │
        └─────────────┘   └────────────────┘   └──────┬──────┘
                                                      │
                                             ┌────────▼────────┐
                                             │      Redis      │
                                             │  pub/sub channel│
                                             └────────┬────────┘
                                                      │
                                        ┌─────────────▼────────────┐
                                        │  notification-service    │
                                        │         :8004            │
                                        └──────────────────────────┘
```

---

## Infrastructure as Code (Terraform in `/terraform`)

OrbitStack provides declarative AWS infrastructure in `/terraform` using **k3s on EC2** to avoid the high fixed cost of managed EKS control planes ($73/month control plane fee alone).

### 💰 Cost Comparison & Teardown

| Architecture | Hourly Cost | Monthly Cost (24/7) | Ideal For |
|--------------|-------------|---------------------|-----------|
| **OrbitStack k3s (t3.medium EC2)** | **~$0.0416 / hr** | **~$30.00 / mo** | Live Demos, Portfolio, Staging |
| **AWS EKS + Nodes** | ~$0.2000 / hr | ~$145.00 / mo | Multi-Team Enterprise Production |

> [!TIP]
> **Destroy when not demoing**: Run `terraform destroy` when you are done presenting. Spin it back up in ~3 minutes with `terraform apply`.

### Provisioning Workflow

```bash
cd terraform

# 1. Initialize Terraform provider and modules
terraform init

# 2. Review infrastructure plan
terraform plan

# 3. Provision AWS VPC, Subnets, Security Groups, IAM Roles, S3 State, & k3s EC2 Node
terraform apply

# 4. Fetch k3s kubeconfig for local kubectl control
scp -i <your-key.pem> ubuntu@$(terraform output -raw k3s_node_public_ip):/etc/rancher/k3s/k3s.yaml ~/.kube/config
sed -i '' "s/127.0.0.1/$(terraform output -raw k3s_node_public_ip)/g" ~/.kube/config

# 5. Teardown infrastructure to stop billing
terraform destroy
```

---

## Kubernetes Deployment (`/k8s`)

OrbitStack includes production-grade Kubernetes manifests in `/k8s` for all 5 services (4 backend + 1 frontend) with:
- **Zero-downtime rolling deploys**: `readinessProbe` and `livenessProbe` on `/health`
- **Auto-scaling**: `HorizontalPodAutoscaler` for `catalog-service` (CPU-based, 2-10 replicas)
- **Ingress routing**: Single NGINX Ingress controller routing `/api/auth`, `/api/catalog`, `/api/orders`, `/api/notification` (and `/api/notify`), and `/` to the frontend.
- **Config & Secret Isolation**: Templated secret configuration with isolated namespace `orbitstack`.

### Quick Minikube Deploy

```bash
# Start minikube with ingress enabled
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
minikube addons enable metrics-server

# Build images in minikube's Docker daemon
eval $(minikube docker-env)
docker build -t orbitstack/auth-service:latest ./services/auth-service
docker build -t orbitstack/catalog-service:latest ./services/catalog-service
docker build -t orbitstack/order-service:latest ./services/order-service
docker build -t orbitstack/notification-service:latest ./services/notification-service
docker build -t orbitstack/frontend:latest ./frontend

# Apply all manifests with single command
kubectl apply -f k8s/ -R

# Verify pods & HPA
kubectl get pods -n orbitstack -w
kubectl get hpa -n orbitstack
```

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

## Cluster Observability & Monitoring (`/monitoring`)

OrbitStack includes a production monitoring stack powered by **kube-prometheus-stack** (Prometheus, Grafana, and Alertmanager) with pre-configured rules and custom dashboards.

### 1. Install kube-prometheus-stack via Helm

```bash
# Add prometheus-community helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack with OrbitStack values
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f monitoring/values.yaml

# Apply standalone Alertmanager PrometheusRule CRD
kubectl apply -f monitoring/alertmanager-rules.yaml
```

### 2. Access Grafana

```bash
# Port-forward Grafana service
kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring
```
- **URL**: `http://localhost:3000`
- **Username**: `admin`
- **Password**: `admin` (configured in `monitoring/values.yaml`)

### 3. Import Custom Grafana Dashboard

1. Log into Grafana at `http://localhost:3000`.
2. Navigate to **Dashboards** → **Import** (or `+` menu → **Import**).
3. Click **Upload dashboard JSON file** and select [`monitoring/grafana-dashboard.json`](file:///c:/Users/rajiv/OneDrive/Desktop/Projects/Main%20Projects/Orbitstack/monitoring/grafana-dashboard.json).
4. Select `Prometheus` as the datasource and click **Import**.

**Dashboard Panels Included**:
- **Per-Service Request Rate**: Live throughput (`req/sec`) per backend microservice.
- **Per-Service p95 Latency**: 95th percentile HTTP response latency (`ms`).
- **Per-Service Error Rate**: Percentage of HTTP 5xx errors per service.
- **Pod CPU Usage**: Active CPU core usage per pod.
- **Pod Memory Usage**: Active memory footprint (`MiB`) per pod.

### 4. Alertmanager Rules

The monitoring stack includes an automated Alertmanager rule (`HighServiceErrorRate`):
- **Condition**: Triggers when any backend service's HTTP 5xx error rate exceeds **5%** over a **5-minute window**.
- **Rule Definition**: [`monitoring/alertmanager-rules.yaml`](file:///c:/Users/rajiv/OneDrive/Desktop/Projects/Main%20Projects/Orbitstack/monitoring/alertmanager-rules.yaml)
```yaml
expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) by (app) / sum(rate(http_requests_total[5m])) by (app)) * 100 > 5
for: 5m
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| IaC | Terraform 1.5+ (AWS VPC, Subnets, SG, IAM, S3 Backend, k3s EC2) |
| Container Orchestration | Kubernetes (k8s) Manifests + HPA + Ingress + minikube |
| Frontend | React 18, TypeScript, Vite 8, Tailwind CSS v4, Three.js (R3F), Framer Motion |
| API Framework | FastAPI 0.111 |
| ORM | SQLModel (SQLAlchemy + Pydantic) |
| Database | PostgreSQL 16 |
| Messaging | Redis 7 pub/sub |
| Observability | prometheus-fastapi-instrumentator |

---

## Local Development (Docker Compose)

```bash
# Start all microservices, databases, and frontend locally
docker-compose up --build

# Open storefront
open http://localhost:3000
```

---

## License

MIT
