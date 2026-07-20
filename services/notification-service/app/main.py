import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.services.subscriber import subscribe_and_listen

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the Redis subscriber as a fire-and-forget background task
    task = asyncio.create_task(subscribe_and_listen())
    yield
    # Graceful shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Notification Service",
    description="Subscribes to Redis order.created events and sends mock email notifications",
    version="1.0.0",
    lifespan=lifespan,
)

Instrumentator().instrument(app).expose(app)


@app.get("/health", tags=["ops"])
def health():
    return {"status": "ok", "service": "notification-service"}
