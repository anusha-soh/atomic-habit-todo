"""
Authentication Middleware
Phase 2 Core Infrastructure - JWT validation
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os

# JWT configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "")
ALGORITHM = "HS256"

# Security scheme
security = HTTPBearer()


def decode_token(token: str) -> dict:
    """
    Decode and validate JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload (with user_id claim)

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(request: Request) -> str:
    """
    Extract user ID from JWT token in Authorization header or cookie.

    Args:
        request: FastAPI request object

    Returns:
        User ID from token payload

    Raises:
        HTTPException: If token is missing or invalid
    """
    # Try to get token from cookie first (httpOnly)
    token = request.cookies.get("auth_token")

    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode token and extract user_id
    payload = decode_token(token)
    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return user_id


def create_access_token(user_id: str, expires_delta: int = 7) -> str:
    """
    Create a new JWT access token.

    Args:
        user_id: User ID to encode in token
        expires_delta: Token expiration in days (default: 7)

    Returns:
        Encoded JWT token string
    """
    from datetime import datetime, timedelta, timezone

    expire = datetime.now(timezone.utc) + timedelta(days=expires_delta)
    to_encode = {"user_id": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
