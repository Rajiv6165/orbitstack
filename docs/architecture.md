# OrbitStack Architecture & Design

OrbitStack is built as a cloud-native microservices platform demonstrating production patterns across API design, authentication, event-driven messaging, data isolation, and Kubernetes orchestration.

---

## 1. System Architecture

The diagram below illustrates the component topology, showing client traffic entering through the **NGINX Ingress Controller**, routing to backend services and the frontend client, and communicating with isolated storage and messaging layers.

```mermaid
flowchart TD
    subgraph External["Client & Gateway Layer"]
        Client["Client Browser / Mobile"]
        Ingress["NGINX Ingress Controller (Port 80/443)"]
    end

    subgraph Presentation["Frontend Layer"]
        Frontend["frontend (React 18 + Vite)\nPort 3000 / 80"]
    end

    subgraph Services["Microservices Layer"]
        AuthSvc["auth-service (FastAPI)\nPort 8001"]
        CatalogSvc["catalog-service (FastAPI)\nPort 8002"]
        OrderSvc["order-service (FastAPI)\nPort 8003"]
        NotifySvc["notification-service (FastAPI)\nPort 8004"]
    end

    subgraph Persistence["Data & Messaging Layer"]
        AuthDB[("PostgreSQL\n(auth_db)")]
        CatalogDB[("PostgreSQL\n(catalog_db)")]
        OrderDB[("PostgreSQL\n(order_db)")]
        RedisDB[("Redis 7\n(Pub/Sub Channel)")]
    end

    %% Client and Ingress Connections
    Client -->|HTTP / HTTPS| Ingress
    Ingress -->|/| Frontend
    Ingress -->|/api/auth| AuthSvc
    Ingress -->|/api/catalog| CatalogSvc
    Ingress -->|/api/orders| OrderSvc
    Ingress -->|/api/notification| NotifySvc

    %% Service to Database Connections
    AuthSvc -->|SQLModel / asyncpg| AuthDB
    CatalogSvc -->|SQLModel / asyncpg| CatalogDB
    OrderSvc -->|SQLModel / asyncpg| OrderDB

    %% Inter-Service & Event Communications
    OrderSvc -->|POST /auth/validate| AuthSvc
    OrderSvc -->|GET & PATCH /products| CatalogSvc
    OrderSvc -->|PUBLISH order.created| RedisDB
    RedisDB -->|SUBSCRIBE order.created| NotifySvc
```

---

## 2. Order Placement Sequence Diagram

The sequence diagram below details the synchronous inter-service orchestration and asynchronous event publishing during an order placement call (`POST /orders`).

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Ingress as NGINX Ingress
    participant OrderSvc as order-service
    participant AuthSvc as auth-service
    participant CatalogSvc as catalog-service
    participant OrderDB as PostgreSQL (order_db)
    participant Redis as Redis Pub/Sub
    participant NotifySvc as notification-service

    Client->>Ingress: POST /api/orders (Authorization: Bearer <token>)
    Ingress->>OrderSvc: POST /orders (headers & payload)
    
    rect rgb(240, 248, 255)
        note right of OrderSvc: Step 1: JWT Validation
        OrderSvc->>AuthSvc: POST /auth/validate { token }
        AuthSvc-->>OrderSvc: 200 OK { valid: true, email: user@domain.com }
    end

    rect rgb(255, 250, 240)
        note right of OrderSvc: Step 2: Stock Check & Reserve
        OrderSvc->>CatalogSvc: GET /products/{id}
        CatalogSvc-->>OrderSvc: 200 OK { stock: 10, price: 29.99 }
        OrderSvc->>CatalogSvc: PATCH /products/{id}/stock { quantity: -qty }
        CatalogSvc-->>OrderSvc: 200 OK { stock: 10 - qty }
    end

    rect rgb(245, 255, 245)
        note right of OrderSvc: Step 3: Persist Order
        OrderSvc->>OrderDB: INSERT INTO order (product_id, qty, price, status)
        OrderDB-->>OrderSvc: Commit Successful (order_id: #1042)
    end

    rect rgb(255, 240, 245)
        note right of OrderSvc: Step 4: Event Publication
        OrderSvc->>Redis: PUBLISH order.created { order_id, email, total }
        OrderSvc-->>Ingress: 201 Created { id: 1042, status: "confirmed" }
        Ingress-->>Client: 201 Created { id: 1042, status: "confirmed" }
    end

    par Asynchronous Notification Processing
        Redis-->>NotifySvc: Message Event: order.created
        note right of NotifySvc: Process notification & log email dispatch
    end
```

---

## 3. Key Design Patterns

### Database-per-Service Isolation
Each microservice manages its own schema and database (`auth_db`, `catalog_db`, `order_db`). Services interact strictly via defined REST APIs or event contracts, eliminating direct cross-database queries.

### Asynchronous Event-Driven Messaging
Order creation is decoupled from notification delivery. `order-service` publishes an `order.created` event to Redis. `notification-service` consumes events asynchronously, preserving low latency for order execution.

### Unified Ingress Routing
External traffic is routed through the NGINX Ingress controller using declarative path rules (`/api/auth`, `/api/catalog`, `/api/orders`, `/api/notification`, `/`), providing a single gateway for the entire platform.
