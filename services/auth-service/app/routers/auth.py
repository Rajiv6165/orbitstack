from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.auth import (
    ErrorResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    ValidateRequest,
    ValidateResponse,
)
from app.services import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Registers a new user in `auth_db`, hashes the password using bcrypt, "
        "and immediately returns a JWT bearer access token."
    ),
    responses={
        201: {
            "description": "User successfully registered. Returns JWT access token.",
            "model": TokenResponse,
        },
        400: {
            "description": "Bad Request — Email address is already registered.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Email is already registered."}
                }
            },
        },
        422: {
            "description": "Validation Error — Invalid email format or missing required payload fields."
        },
    },
)
def register(req: RegisterRequest, session: Session = Depends(get_session)):
    """Register a new user and immediately return an access token."""
    if auth_service.get_user_by_email(session, req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered.",
        )
    auth_service.create_user(session, req.email, req.password)
    token = auth_service.create_access_token({"sub": req.email})
    return TokenResponse(access_token=token)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user & issue JWT",
    description=(
        "Verifies user credentials against `auth_db` using bcrypt password verification. "
        "Returns a signed JWT bearer token upon successful authentication."
    ),
    responses={
        200: {
            "description": "Authentication successful. Returns JWT access token.",
            "model": TokenResponse,
        },
        401: {
            "description": "Unauthorized — Invalid email or password.",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid email or password."}
                }
            },
        },
        422: {
            "description": "Validation Error — Missing or invalid input payload."
        },
    },
)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    """Authenticate and return an access token."""
    user = auth_service.get_user_by_email(session, req.email)
    if not user or not auth_service.verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    token = auth_service.create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@router.post(
    "/validate",
    response_model=ValidateResponse,
    summary="Validate JWT token",
    description=(
        "Decodes and verifies a JWT token signature and expiration. "
        "Called internally by inter-service clients like `order-service`."
    ),
    responses={
        200: {
            "description": "Token validation result. Returns valid boolean flag and subject email if valid.",
            "model": ValidateResponse,
        },
        422: {
            "description": "Validation Error — Missing or malformed token string in payload."
        },
    },
)
def validate(req: ValidateRequest):
    """Validate a JWT. Called internally by order-service."""
    payload = auth_service.decode_token(req.token)
    if payload is None:
        return ValidateResponse(valid=False)
    return ValidateResponse(valid=True, email=payload.get("sub"))
