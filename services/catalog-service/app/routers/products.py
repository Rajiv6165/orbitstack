from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.product import ProductCreate, ProductRead, StockAdjust
from app.services import product_service

router = APIRouter()


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, session: Session = Depends(get_session)):
    """Create a new product."""
    return product_service.create_product(session, payload)


@router.get("/", response_model=List[ProductRead])
def list_products(session: Session = Depends(get_session)):
    """Return all products."""
    return product_service.list_products(session)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    """Retrieve a single product by ID."""
    return product_service.get_product(session, product_id)


@router.patch("/{product_id}/stock", response_model=ProductRead)
def adjust_stock(
    product_id: int,
    payload: StockAdjust,
    session: Session = Depends(get_session),
):
    """
    Adjust stock for a product.
    Used internally by order-service when an order is placed.
    """
    return product_service.adjust_stock(session, product_id, payload.quantity)
