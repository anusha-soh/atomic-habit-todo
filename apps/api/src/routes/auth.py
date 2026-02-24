"""
Authentication Routes
Phase 2 Core Infrastructure - Register, Login, Logout, Me
"""
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlmodel import Session
from pydantic import BaseModel, EmailStr
from uuid import UUID
import os

from src.database import get_session
from src.services.auth_service import AuthService, AuthenticationError, ValidationError
from src.middleware.auth import get_current_user_id
from src.rate_limiter import limiter

router = APIRouter()

# Cookie security: Use secure cookies only in production (HTTPS)
COOKIE_SECURE = os.getenv("ENVIRONMENT", "development") == "production"


# Request/Response Models
class RegisterRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User profile response"""
    id: str
    email: str
    created_at: str


class SessionResponse(BaseModel):
    """Session response"""
    id: str
    expires_at: str


class RegisterResponse(BaseModel):
    """Registration response"""
    user: UserResponse


class LoginResponse(BaseModel):
    """Login response"""
    user: UserResponse
    session: SessionResponse


class LogoutResponse(BaseModel):
    """Logout response"""
    message: str


class UserProfileResponse(BaseModel):
    """Current user profile response"""
    user: UserResponse


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/5minute")
async def register(
    request: Request,
    register_data: RegisterRequest,
    response: Response,
    db: Session = Depends(get_session)
):
    """
    Register a new user.

    Args:
        http_request: FastAPI request object (required for rate limiting)
        register_data: Registration data (email, password)
        response: FastAPI response object (for setting cookie)
        db: Database session

    Returns:
        RegisterResponse with user data

    Raises:
        HTTPException 400: Validation error (invalid email/password)
        HTTPException 409: Email already registered
        HTTPException 500: Server error
    """
    try:
        auth_service = AuthService(db)
        user, token = auth_service.register(register_data.email, register_data.password)

        # Set httpOnly cookie with JWT token
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=COOKIE_SECURE,  # HTTPS only in production
            samesite="strict",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )

        return RegisterResponse(
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                created_at=user.created_at.isoformat(),
            )
        )

    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_session)
):
    """
    Login with email and password.

    Args:
        http_request: FastAPI request object (required for rate limiting)
        login_data: Login credentials (email, password)
        response: FastAPI response object (for setting cookie)
        db: Database session

    Returns:
        LoginResponse with user and session data

    Raises:
        HTTPException 401: Invalid credentials
        HTTPException 500: Server error
    """
    try:
        auth_service = AuthService(db)
        user, session, token = auth_service.login(login_data.email, login_data.password)

        # Set httpOnly cookie with JWT token
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="strict",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )

        return LoginResponse(
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                created_at=user.created_at.isoformat(),
            ),
            session=SessionResponse(
                id=str(session.id),
                expires_at=session.expires_at.isoformat(),
            ),
        )

    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed",
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_session)
):
    """
    Logout current user (invalidate session).

    Args:
        request: FastAPI request object (for reading cookie)
        response: FastAPI response object (for clearing cookie)
        db: Database session

    Returns:
        LogoutResponse with success message

    Raises:
        HTTPException 500: Server error
    """
    try:
        # Get token from cookie
        token = request.cookies.get("auth_token")

        if token:
            auth_service = AuthService(db)
            auth_service.logout(token)

        # Clear httpOnly cookie
        response.delete_cookie(
            key="auth_token",
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="strict",
        )

        return LogoutResponse(message="Logout successful")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed",
        )


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user(
    request: Request,
    db: Session = Depends(get_session)
):
    """
    Get current authenticated user's profile.

    Args:
        request: FastAPI request object (for reading cookie/header)
        db: Database session

    Returns:
        UserProfileResponse with current user data

    Raises:
        HTTPException 401: Not authenticated or invalid token
        HTTPException 500: Server error
    """
    try:
        # Get user ID from JWT token
        user_id = get_current_user_id(request)

        # Get user from database
        auth_service = AuthService(db)
        user = auth_service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        return UserProfileResponse(
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                created_at=user.created_at.isoformat(),
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile",
        )
