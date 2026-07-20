from typing import Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    sku: str


class ProductRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    sku: str

    model_config = {"from_attributes": True}


class ProductUpdate(BaseModel):
    """Partial update — all fields optional."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None


class StockAdjust(BaseModel):
    """
    quantity > 0  →  restock
    quantity < 0  →  decrement (used by order-service when order is placed)
    """
    quantity: int
