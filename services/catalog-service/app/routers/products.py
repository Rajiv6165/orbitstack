from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.product import ErrorResponse, ProductCreate, ProductRead, StockAdjust
from app.services import product_service

router = APIRouter()


@router.post(
    "/",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create product catalog item",
    description="Creates a new product record in `catalog_db` and initializes inventory stock.",
    responses={
        201: {
            "description": "Product created successfully.",
            "model": ProductRead,
        },
        400: {
            "description": "Bad Request — Invalid product payload.",
            "model": ErrorResponse,
        },
        422: {
            "description": "Validation Error — Missing or invalid required product fields."
        },
    },
)
def create_product(payload: ProductCreate, session: Session = Depends(get_session)):
    """Create a new product."""
    return product_service.create_product(session, payload)


@router.get(
    "/",
    response_model=List[ProductRead],
    summary="List all product catalog items",
    description="Retrieves a list of all active products and inventory levels from `catalog_db`.",
    responses={
        200: {
            "description": "List of products retrieved successfully.",
            "model": List[ProductRead],
        }
    },
)
def list_products(session: Session = Depends(get_session)):
    """Return all products."""
    return product_service.list_products(session)


@router.get(
    "/{product_id}",
    response_model=ProductRead,
    summary="Get product by ID",
    description="Fetches detailed product information and stock levels for a specific product ID.",
    responses={
        200: {
            "description": "Product details retrieved successfully.",
            "model": ProductRead,
        },
        404: {
            "description": "Not Found — Product ID does not exist.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Product with ID 42 not found"}
                }
            },
        },
    },
)
def get_product(product_id: int, session: Session = Depends(get_session)):
    """Retrieve a single product by ID."""
    return product_service.get_product(session, product_id)


@router.patch(
    "/{product_id}/stock",
    response_model=ProductRead,
    summary="Adjust product stock quantity",
    description=(
        "Adjusts available inventory stock for a product in `catalog_db`. "
        "Pass negative quantity to reserve/decrement stock (used by `order-service`), or positive quantity to restock."
    ),
    responses={
        200: {
            "description": "Product stock successfully adjusted.",
            "model": ProductRead,
        },
        400: {
            "description": "Bad Request — Insufficient stock available to fulfill decrement.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Insufficient stock for product ID 1"}
                }
            },
        },
        404: {
            "description": "Not Found — Product ID does not exist.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Product with ID 42 not found"}
                }
            },
        },
        422: {
            "description": "Validation Error — Invalid quantity integer."
        },
    },
)
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
