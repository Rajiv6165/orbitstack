from typing import List, Optional
from pydantic import BaseModel, Field


class NotificationEvent(BaseModel):
    order_id: int = Field(..., example=101, description="Order ID associated with the notification")
    customer_email: str = Field(..., example="user@orbitstack.io", description="Customer recipient email address")
    product_id: int = Field(..., example=1, description="Ordered product ID")
    product_name: Optional[str] = Field(None, example="Quantum Processor i9", description="Ordered product name")
    quantity: int = Field(..., example=2, description="Ordered quantity")
    total_price: float = Field(..., example=999.98, description="Total order amount")

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
