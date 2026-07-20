from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Order(SQLModel, table=True):
    """Persisted order entity."""

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int
    quantity: int = Field(ge=1)
    customer_email: str = Field(index=True)
    status: str = Field(default="pending")
    total_price: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
