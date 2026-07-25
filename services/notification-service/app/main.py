import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.schemas.notification import NotificationListResponse
from app.services.subscriber import received_events, subscribe_and_listen

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


tags_metadata = [
    {
        "name": "notifications",
        "description": "Notification subscriber and event processing history endpoints.",
    },
    {
        "name": "ops",
        "description": "Operational and health check endpoints.",
    },
]

app = FastAPI(
    title="Notification Service API",
    description=(
        "**OrbitStack Notification Service**\n\n"
        "Subscribes asynchronously to Redis `order.created` Pub/Sub channels and dispatches simulated email notifications."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

Instrumentator().instrument(app).expose(app)


@app.get(
    "/health",
    tags=["ops"],
    summary="Health check endpoint",
    description="Returns operational status of the Notification Service.",
    responses={
        200: {
            "description": "Service is healthy.",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "service": "notification-service"}
                }
            },
        }
    },
)
def health():
    return {"status": "ok", "service": "notification-service"}


@app.get(
    "/notifications",
    response_model=NotificationListResponse,
    tags=["notifications"],
    summary="List received event notifications",
    description="Retrieves a list of all order notification events received by the Redis Pub/Sub background listener.",
    responses={
        200: {
            "description": "List of received notifications retrieved successfully.",
            "model": NotificationListResponse,
        }
    },
)
def get_notifications():
    return {"notifications": received_events}
