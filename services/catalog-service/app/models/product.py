from typing import Optional

from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    """Product entity stored in the `product` table."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    sku: str = Field(unique=True, index=True, max_length=100)
