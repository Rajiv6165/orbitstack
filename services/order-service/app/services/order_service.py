import json
import logging
import os

import httpx
import redis
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.order import Order
from app.schemas.order import OrderCreate

logger = logging.getLogger(__name__)

AUTH_SERVICE_URL: str = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")
CATALOG_SERVICE_URL: str = os.getenv("CATALOG_SERVICE_URL", "http://catalog-service:8000")
REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379")


def _get_redis() -> redis.Redis:
    return redis.from_url(REDIS_URL, decode_responses=True)


async def place_order(session: Session, payload: OrderCreate, token: str) -> Order:
    """
    Orchestrates a complete order placement:
    1. Validate JWT via auth-service
    2. Fetch product + verify stock via catalog-service
    3. Decrement stock in catalog-service
    4. Persist order record
    5. Publish order.created event to Redis
    """
    # ── Step 1: JWT validation ────────────────────────────────────────────────
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            auth_resp = await client.post(
                f"{AUTH_SERVICE_URL}/auth/validate",
                json={"token": token},
            )
            auth_resp.raise_for_status()
        except httpx.RequestError as exc:
            logger.error("auth-service unreachable: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is unavailable.",
            )

        auth_data = auth_resp.json()
        if not auth_data.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid or expired.",
            )
        customer_email: str = auth_data["email"]

    # ── Step 2: Stock check ───────────────────────────────────────────────────
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            product_resp = await client.get(
                f"{CATALOG_SERVICE_URL}/products/{payload.product_id}"
            )
        except httpx.RequestError as exc:
            logger.error("catalog-service unreachable: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Catalog service is unavailable.",
            )

        if product_resp.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {payload.product_id} not found.",
            )
        product_resp.raise_for_status()
        product = product_resp.json()

        if product["stock"] < payload.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock. "
                    f"Available: {product['stock']}, requested: {payload.quantity}."
                ),
            )
        total_price: float = round(product["price"] * payload.quantity, 2)

    # ── Step 3: Decrement stock ───────────────────────────────────────────────
    async with httpx.AsyncClient(timeout=10.0) as client:
        stock_resp = await client.patch(
            f"{CATALOG_SERVICE_URL}/products/{payload.product_id}/stock",
            json={"quantity": -payload.quantity},
        )
        stock_resp.raise_for_status()

    # ── Step 4: Persist order ─────────────────────────────────────────────────
    order = Order(
        product_id=payload.product_id,
        quantity=payload.quantity,
        customer_email=customer_email,
        total_price=total_price,
        status="confirmed",
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    # ── Step 5: Publish event ─────────────────────────────────────────────────
    event = {
        "order_id": order.id,
        "customer_email": customer_email,
        "product_id": payload.product_id,
        "quantity": payload.quantity,
        "total_price": total_price,
        "product_name": product.get("name", ""),
    }
    try:
        r = _get_redis()
        r.publish("order.created", json.dumps(event))
        logger.info("Published order.created event for order #%s", order.id)
    except redis.RedisError as exc:
        # Non-fatal — order is already committed; notification is best-effort
        logger.warning("Failed to publish Redis event: %s", exc)

    return order


def get_order(session: Session, order_id: int) -> Order:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found.",
        )
    return order


def list_orders(session: Session):
    return list(session.exec(select(Order)).all())
