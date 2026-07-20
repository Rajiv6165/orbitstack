from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    ValidateRequest,
    ValidateResponse,
)
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
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


@router.post("/login", response_model=TokenResponse)
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


@router.post("/validate", response_model=ValidateResponse)
def validate(req: ValidateRequest):
    """Validate a JWT. Called internally by order-service."""
    payload = auth_service.decode_token(req.token)
    if payload is None:
        return ValidateResponse(valid=False)
    return ValidateResponse(valid=True, email=payload.get("sub"))
