from typing import Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standardized error response payload."""
    detail: str = Field(..., example="Product not found or invalid inventory quantity.")


class ProductCreate(BaseModel):
    name: str = Field(..., example="Quantum Processor i9", description="Name of the product")
    description: Optional[str] = Field(None, example="Next-gen 16-core computing processor", description="Product description")
    price: float = Field(..., gt=0, example=499.99, description="Unit price in USD (must be positive)")
    stock: int = Field(0, ge=0, example=50, description="Available stock inventory quantity")
    sku: str = Field(..., example="CPU-QP-001", description="Stock Keeping Unit identifier")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Quantum Processor i9",
                "description": "Next-gen 16-core computing processor",
                "price": 499.99,
                "stock": 50,
                "sku": "CPU-QP-001",
            }
        }
    }


class ProductRead(BaseModel):
    id: int = Field(..., example=1, description="Unique product ID")
    name: str = Field(..., example="Quantum Processor i9", description="Name of the product")
    description: Optional[str] = Field(None, example="Next-gen 16-core computing processor", description="Product description")
    price: float = Field(..., example=499.99, description="Unit price in USD")
    stock: int = Field(..., example=50, description="Current stock quantity")
    sku: str = Field(..., example="CPU-QP-001", description="Stock Keeping Unit identifier")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "name": "Quantum Processor i9",
                "description": "Next-gen 16-core computing processor",
                "price": 499.99,
                "stock": 50,
                "sku": "CPU-QP-001",
            }
        },
    }


class ProductUpdate(BaseModel):
    """Partial update — all fields optional."""
    name: Optional[str] = Field(None, example="Quantum Processor i9 Pro")
    description: Optional[str] = Field(None, example="Updated description")
    price: Optional[float] = Field(None, example=549.99)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Quantum Processor i9 Pro",
                "description": "Updated description",
                "price": 549.99,
            }
        }
    }


class StockAdjust(BaseModel):
    """
    quantity > 0  →  restock
    quantity < 0  →  decrement (used by order-service when order is placed)
    """
    quantity: int = Field(..., example=-3, description="Quantity adjustment (+ve for restock, -ve for reservation)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "quantity": -3
            }
        }
    }
