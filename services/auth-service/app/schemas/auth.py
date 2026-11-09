from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class ErrorResponse(BaseModel):
    """Standardized error response payload."""
    detail: str = Field(..., json_schema_extra={"example": "Invalid credentials or request data."})


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address", json_schema_extra={"example": "user@orbitstack.io"})
    password: str = Field(..., max_length=72, description="User's password", json_schema_extra={"example": "SecurePass123!"})

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@orbitstack.io",
                "password": "SecurePass123!",
            }
        }
    }


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address", json_schema_extra={"example": "user@orbitstack.io"})
    password: str = Field(..., max_length=72, description="User password", json_schema_extra={"example": "SecurePass123!"})

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@orbitstack.io",
                "password": "SecurePass123!",
            }
        }
    }


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT bearer access token", json_schema_extra={"example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."})
    token_type: str = Field("bearer", description="Token authorization type", json_schema_extra={"example": "bearer"})

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ...",
                "token_type": "bearer",
            }
        }
    }


class ValidateRequest(BaseModel):
    token: str = Field(..., description="JWT access token string to validate", json_schema_extra={"example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."})

    model_config = {
        "json_schema_extra": {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQG9yYml0c3RhY2suaW8ifQ..."
            }
        }
    }


class ValidateResponse(BaseModel):
    valid: bool = Field(..., description="True if token is valid and unexpired", json_schema_extra={"example": True})
    email: Optional[str] = Field(None, description="Email subject extracted from token payload", json_schema_extra={"example": "user@orbitstack.io"})

    model_config = {
        "json_schema_extra": {
            "example": {
                "valid": True,
                "email": "user@orbitstack.io",
            }
        }
    }
