from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.db.session import create_db_and_tables
from app.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — create tables (used in dev/test without Alembic)
    create_db_and_tables()
    yield
    # shutdown — nothing to clean up


app = FastAPI(
    title="Auth Service",
    description="JWT issuing / validation + user management",
    version="1.0.0",
    lifespan=lifespan,
)

# Prometheus metrics — exposes /metrics
Instrumentator().instrument(app).expose(app)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/health", tags=["ops"])
def health():
    return {"status": "ok", "service": "auth-service"}
