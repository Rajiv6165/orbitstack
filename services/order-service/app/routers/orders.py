from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.order import OrderCreate, OrderRead
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


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
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


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, session: Session = Depends(get_session)):
    """Retrieve an order by ID."""
    return order_service.get_order(session, order_id)
