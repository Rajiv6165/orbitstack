from typing import Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standardized error response payload."""
    detail: str = Field(..., json_schema_extra={"example": "Product not found or invalid inventory quantity."})


class ProductCreate(BaseModel):
    name: str = Field(..., description="Name of the product", json_schema_extra={"example": "Quantum Processor i9"})
    description: Optional[str] = Field(None, description="Product description", json_schema_extra={"example": "Next-gen 16-core computing processor"})
    price: float = Field(..., gt=0, description="Unit price in USD (must be positive)", json_schema_extra={"example": 499.99})
    stock: int = Field(0, ge=0, description="Available stock inventory quantity", json_schema_extra={"example": 50})
    sku: str = Field(..., description="Stock Keeping Unit identifier", json_schema_extra={"example": "CPU-QP-001"})

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
    id: int = Field(..., description="Unique product ID", json_schema_extra={"example": 1})
    name: str = Field(..., description="Name of the product", json_schema_extra={"example": "Quantum Processor i9"})
    description: Optional[str] = Field(None, description="Product description", json_schema_extra={"example": "Next-gen 16-core computing processor"})
    price: float = Field(..., description="Unit price in USD", json_schema_extra={"example": 499.99})
    stock: int = Field(..., description="Current stock quantity", json_schema_extra={"example": 50})
    sku: str = Field(..., description="Stock Keeping Unit identifier", json_schema_extra={"example": "CPU-QP-001"})

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
    name: Optional[str] = Field(None, json_schema_extra={"example": "Quantum Processor i9 Pro"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "Updated description"})
    price: Optional[float] = Field(None, json_schema_extra={"example": 549.99})

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
    quantity: int = Field(..., description="Quantity adjustment (+ve for restock, -ve for reservation)", json_schema_extra={"example": -3})

    model_config = {
        "json_schema_extra": {
            "example": {
                "quantity": -3
            }
        }
    }
