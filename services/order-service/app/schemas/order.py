from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    customer_email: str
    status: str
    total_price: float
    created_at: datetime

    model_config = {"from_attributes": True}
