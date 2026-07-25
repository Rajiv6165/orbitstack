from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.logging import RequestTracingMiddleware, setup_json_logging
from app.db.session import create_db_and_tables
from app.routers import products

# Initialize structured JSON logging
setup_json_logging(service_name="catalog-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


tags_metadata = [
    {
        "name": "products",
        "description": "Product catalog and stock inventory management CRUD operations.",
    },
    {
        "name": "ops",
        "description": "Operational and health check endpoints.",
    },
]

app = FastAPI(
    title="Catalog Service API",
    description=(
        "**OrbitStack Catalog Service**\n\n"
        "Manages product listings, detailed metadata, and stock inventory levels in `catalog_db`."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# Add request tracing middleware for X-Request-ID propagation
app.add_middleware(RequestTracingMiddleware, service_name="catalog-service")

Instrumentator().instrument(app).expose(app)

app.include_router(products.router, prefix="/products", tags=["products"])


@app.get(
    "/health",
    tags=["ops"],
    summary="Health check endpoint",
    description="Returns operational status of the Catalog Service.",
    responses={
        200: {
            "description": "Service is healthy.",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "service": "catalog-service"}
                }
            },
        }
    },
)
def health():
    return {"status": "ok", "service": "catalog-service"}
