from typing import List

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.product import Product
from app.schemas.product import ProductCreate


def create_product(session: Session, data: ProductCreate) -> Product:
    existing = session.exec(select(Product).where(Product.sku == data.sku)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A product with SKU '{data.sku}' already exists.",
        )
    product = Product(**data.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def list_products(session: Session) -> List[Product]:
    return list(session.exec(select(Product)).all())


def get_product(session: Session, product_id: int) -> Product:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found.",
        )
    return product


def adjust_stock(session: Session, product_id: int, quantity: int) -> Product:
    """
    Adjust stock by `quantity` (positive = restock, negative = decrement).
    Raises 400 if the resulting stock would go below zero.
    """
    product = get_product(session, product_id)
    if product.stock + quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock}, requested: {abs(quantity)}.",
        )
    product.stock += quantity
    session.add(product)
    session.commit()
    session.refresh(product)
    return product
