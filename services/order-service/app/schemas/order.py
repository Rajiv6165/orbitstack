from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standardized error response payload."""
    detail: str = Field(..., example="Invalid token or product stock unavailable.")


class OrderCreate(BaseModel):
    product_id: int = Field(..., example=1, description="ID of the product to order")
    quantity: int = Field(..., ge=1, example=2, description="Quantity to purchase (must be at least 1)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": 1,
                "quantity": 2,
            }
        }
    }


class OrderRead(BaseModel):
    id: int = Field(..., example=101, description="Unique order ID")
    product_id: int = Field(..., example=1, description="ID of the ordered product")
    quantity: int = Field(..., example=2, description="Quantity ordered")
    customer_email: str = Field(..., example="user@orbitstack.io", description="Customer email retrieved from JWT token")
    status: str = Field(..., example="confirmed", description="Order confirmation status")
    total_price: float = Field(..., example=999.98, description="Calculated total order price in USD")
    created_at: datetime = Field(..., example="2026-07-25T12:00:00Z", description="Timestamp when order was placed")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 101,
                "product_id": 1,
                "quantity": 2,
                "customer_email": "user@orbitstack.io",
                "status": "confirmed",
                "total_price": 999.98,
                "created_at": "2026-07-25T12:00:00Z",
            }
        },
    }
