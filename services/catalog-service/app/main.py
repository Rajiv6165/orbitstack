from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.db.session import create_db_and_tables
from app.routers import products


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Catalog Service",
    description="Product & inventory management",
    version="1.0.0",
    lifespan=lifespan,
)

Instrumentator().instrument(app).expose(app)

app.include_router(products.router, prefix="/products", tags=["products"])


@app.get("/health", tags=["ops"])
def health():
    return {"status": "ok", "service": "catalog-service"}
