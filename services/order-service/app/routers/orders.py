from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.order import ErrorResponse, OrderCreate, OrderRead
from app.services import order_service

router = APIRouter()


def _extract_token(authorization: str = Header(...)) -> str:
    """Extract the bearer token from the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be 'Bearer <token>'.",
        )
    return authorization.removeprefix("Bearer ")


@router.post(
    "/",
    response_model=OrderRead,
    status_code=status.HTTP_201_CREATED,
    summary="Place a new order",
    description=(
        "Orchestrates full order placement:\n"
        "1. Validates JWT Bearer token with `auth-service` to extract customer email.\n"
        "2. Verifies product existence & decrements inventory stock via `catalog-service`.\n"
        "3. Persists order record in `order_db`.\n"
        "4. Asynchronously publishes an `order.created` event to Redis Pub/Sub for `notification-service`."
    ),
    responses={
        201: {
            "description": "Order placed successfully.",
            "model": OrderRead,
        },
        400: {
            "description": "Bad Request — Product stock unavailable or invalid quantity requested.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Insufficient stock available"}
                }
            },
        },
        401: {
            "description": "Unauthorized — Missing or invalid JWT authorization header.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Authorization header must be 'Bearer <token>'."}
                }
            },
        },
        404: {
            "description": "Not Found — Product does not exist.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Product not found"}
                }
            },
        },
        422: {
            "description": "Validation Error — Missing product_id or quantity < 1."
        },
    },
)
async def place_order(
    payload: OrderCreate,
    session: Session = Depends(get_session),
    token: str = Depends(_extract_token),
):
    """
    Place a new order.

    Requires a valid JWT in the `Authorization: Bearer <token>` header.
    The service will:
    - Validate the token with auth-service
    - Check and decrement stock via catalog-service
    - Persist the order and publish an `order.created` event to Redis
    """
    return await order_service.place_order(session, payload, token)


@router.get(
    "/{order_id}",
    response_model=OrderRead,
    summary="Get order details by ID",
    description="Retrieves persisted order record and status from `order_db` by ID.",
    responses={
        200: {
            "description": "Order details retrieved successfully.",
            "model": OrderRead,
        },
        404: {
            "description": "Not Found — Order ID does not exist.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Order not found"}
                }
            },
        },
    },
)
def get_order(order_id: int, session: Session = Depends(get_session)):
    """Retrieve an order by ID."""
    return order_service.get_order(session, order_id)
