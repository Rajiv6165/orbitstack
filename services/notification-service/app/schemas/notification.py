from typing import List, Optional
from pydantic import BaseModel, Field


class NotificationEvent(BaseModel):
    order_id: int = Field(..., description="Order ID associated with the notification", json_schema_extra={"example": 101})
    customer_email: str = Field(..., description="Customer recipient email address", json_schema_extra={"example": "user@orbitstack.io"})
    product_id: int = Field(..., description="Ordered product ID", json_schema_extra={"example": 1})
    product_name: Optional[str] = Field(None, description="Ordered product name", json_schema_extra={"example": "Quantum Processor i9"})
    quantity: int = Field(..., description="Ordered quantity", json_schema_extra={"example": 2})
    total_price: float = Field(..., description="Total order amount", json_schema_extra={"example": 999.98})

    model_config = {
        "json_schema_extra": {
            "example": {
                "order_id": 101,
                "customer_email": "user@orbitstack.io",
                "product_id": 1,
                "product_name": "Quantum Processor i9",
                "quantity": 2,
                "total_price": 999.98,
            }
        }
    }


class NotificationListResponse(BaseModel):
    notifications: List[NotificationEvent] = Field(..., description="List of received Redis order.created event notifications")

    model_config = {
        "json_schema_extra": {
            "example": {
                "notifications": [
                    {
                        "order_id": 101,
                        "customer_email": "user@orbitstack.io",
                        "product_id": 1,
                        "product_name": "Quantum Processor i9",
                        "quantity": 2,
                        "total_price": 999.98,
                    }
                ]
            }
        }
    }
