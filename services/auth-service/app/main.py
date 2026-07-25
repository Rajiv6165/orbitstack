from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.logging import RequestTracingMiddleware, setup_json_logging
from app.db.session import create_db_and_tables
from app.routers import auth

# Initialize structured JSON logging
setup_json_logging(service_name="auth-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — create tables (used in dev/test without Alembic)
    create_db_and_tables()
    yield
    # shutdown — nothing to clean up


tags_metadata = [
    {
        "name": "auth",
        "description": "Authentication management: User registration, login, password hashing, and JWT issuance/validation.",
    },
    {
        "name": "ops",
        "description": "Operational and health check endpoints.",
    },
]

app = FastAPI(
    title="Auth Service API",
    description=(
        "**OrbitStack Auth Service**\n\n"
        "Provides user authentication, secure bcrypt password hashing, and HS256 JWT access token generation and validation."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# Add request tracing middleware for X-Request-ID propagation
app.add_middleware(RequestTracingMiddleware, service_name="auth-service")

# Prometheus metrics — exposes /metrics
Instrumentator().instrument(app).expose(app)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get(
    "/health",
    tags=["ops"],
    summary="Health check endpoint",
    description="Returns operational status of the Auth Service.",
    responses={
        200: {
            "description": "Service is healthy.",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "service": "auth-service"}
                }
            },
        }
    },
)
def health():
    return {"status": "ok", "service": "auth-service"}
