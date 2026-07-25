from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.logging import RequestTracingMiddleware, setup_json_logging
from app.db.session import create_db_and_tables
from app.routers import orders

# Initialize structured JSON logging
setup_json_logging(service_name="order-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


tags_metadata = [
    {
        "name": "orders",
        "description": "Order placement and status management with inter-service validation and Redis event publishing.",
    },
    {
        "name": "ops",
        "description": "Operational and health check endpoints.",
    },
]

app = FastAPI(
    title="Order Service API",
    description=(
        "**OrbitStack Order Service**\n\n"
        "Orchestrates order workflow: validates JWT with Auth Service, verifies and reserves stock via Catalog Service, saves to `order_db`, and publishes `order.created` events over Redis Pub/Sub."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# Add request tracing middleware for X-Request-ID propagation
app.add_middleware(RequestTracingMiddleware, service_name="order-service")

Instrumentator().instrument(app).expose(app)

app.include_router(orders.router, prefix="/orders", tags=["orders"])


@app.get(
    "/health",
    tags=["ops"],
    summary="Health check endpoint",
    description="Returns operational status of the Order Service.",
    responses={
        200: {
            "description": "Service is healthy.",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "service": "order-service"}
                }
            },
        }
    },
)
def health():
    return {"status": "ok", "service": "order-service"}
