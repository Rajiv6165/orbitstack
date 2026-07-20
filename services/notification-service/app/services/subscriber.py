import asyncio
import json
import logging
import os

import redis.asyncio as aioredis

logger = logging.getLogger("notification-service.subscriber")

REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379")
CHANNEL: str = "order.created"


async def _handle_event(raw_data: bytes | str) -> None:
    """Parse and log a mock email notification for an order.created event."""
    try:
        event = json.loads(raw_data)
        logger.info(
            "📧  [MOCK EMAIL] Order confirmed!\n"
            "    To      : %s\n"
            "    Order # : %s\n"
            "    Product : %s (ID: %s)\n"
            "    Qty     : %s\n"
            "    Total   : $%.2f",
            event.get("customer_email", "unknown"),
            event.get("order_id", "?"),
            event.get("product_name", ""),
            event.get("product_id", "?"),
            event.get("quantity", "?"),
            event.get("total_price", 0.0),
        )
    except (json.JSONDecodeError, KeyError) as exc:
        logger.error("Failed to process order.created event: %s | raw=%s", exc, raw_data)


async def subscribe_and_listen() -> None:
    """
    Connect to Redis and subscribe to the `order.created` channel.
    Runs indefinitely as an asyncio background task.
    Retries with exponential back-off on connection errors.
    """
    backoff = 1
    while True:
        try:
            r = aioredis.from_url(REDIS_URL, decode_responses=True)
            pubsub = r.pubsub()
            await pubsub.subscribe(CHANNEL)
            logger.info("✅  Subscribed to Redis channel '%s'", CHANNEL)
            backoff = 1  # reset on successful connect

            async for message in pubsub.listen():
                if message["type"] == "message":
                    await _handle_event(message["data"])

        except Exception as exc:
            logger.warning(
                "Redis subscriber error: %s — retrying in %ds", exc, backoff
            )
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 60)
