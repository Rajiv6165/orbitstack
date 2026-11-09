from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standardized error response payload."""
    detail: str = Field(..., json_schema_extra={"example": "Invalid token or product stock unavailable."})


class OrderCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product to order", json_schema_extra={"example": 1})
    quantity: int = Field(..., ge=1, description="Quantity to purchase (must be at least 1)", json_schema_extra={"example": 2})

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": 1,
                "quantity": 2,
            }
        }
    }


class OrderRead(BaseModel):
    id: int = Field(..., description="Unique order ID", json_schema_extra={"example": 101})
    product_id: int = Field(..., description="ID of the ordered product", json_schema_extra={"example": 1})
    quantity: int = Field(..., description="Quantity ordered", json_schema_extra={"example": 2})
    customer_email: str = Field(..., description="Customer email retrieved from JWT token", json_schema_extra={"example": "user@orbitstack.io"})
    status: str = Field(..., description="Order confirmation status", json_schema_extra={"example": "confirmed"})
    total_price: float = Field(..., description="Calculated total order price in USD", json_schema_extra={"example": 999.98})
    created_at: datetime = Field(..., description="Timestamp when order was placed", json_schema_extra={"example": "2026-07-25T12:00:00Z"})

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
