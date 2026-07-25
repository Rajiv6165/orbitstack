from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class ErrorResponse(BaseModel):
    """Standardized error response payload."""
    detail: str = Field(..., example="Invalid credentials or request data.")


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., example="user@orbitstack.io", description="User's email address")
    password: str = Field(..., example="SecurePass123!", description="User's password")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@orbitstack.io",
                "password": "SecurePass123!",
            }
        }
    }


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., example="user@orbitstack.io", description="Registered email address")
    password: str = Field(..., example="SecurePass123!", description="User password")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@orbitstack.io",
                "password": "SecurePass123!",
            }
        }
    }


class TokenResponse(BaseModel):
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description="JWT bearer access token")
    token_type: str = Field("bearer", example="bearer", description="Token authorization type")

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ...",
                "token_type": "bearer",
            }
        }
    }


class ValidateRequest(BaseModel):
    token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description="JWT access token string to validate")

    model_config = {
        "json_schema_extra": {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ..."
            }
        }
    }


class ValidateResponse(BaseModel):
    valid: bool = Field(..., example=True, description="True if token is valid and unexpired")
    email: Optional[str] = Field(None, example="user@orbitstack.io", description="Email subject extracted from token payload")

    model_config = {
        "json_schema_extra": {
            "example": {
                "valid": True,
                "email": "user@orbitstack.io",
            }
        }
    }
