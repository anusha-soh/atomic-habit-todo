"""
Authentication Service
Phase 2 Core Infrastructure - User registration, login, logout
"""
from sqlmodel import Session, select
import bcrypt
from datetime import datetime, timezone, timedelta
from uuid import UUID
import re
from typing import Optional

from src.models.user import User
from src.models.session import Session as SessionModel
from src.middleware.auth import create_access_token
from src.services.event_emitter import event_emitter

# Email validation regex (RFC 5322 simplified)
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


class AuthenticationError(Exception):
    """Raised when authentication fails"""
    pass


class ValidationError(Exception):
    """Raised when input validation fails"""
    pass


def validate_email(email: str) -> str:
    """
    Validate email format and normalize.

    Args:
        email: Email address to validate

    Returns:
        Normalized email (lowercase)

    Raises:
        ValidationError: If email format is invalid
    """
    email = email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise ValidationError("Invalid email format")
    return email


def validate_password(password: str) -> None:
    """
    Validate password meets requirements.

    Args:
        password: Password to validate

    Raises:
        ValidationError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters")


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.

    Args:
        password: Plaintext password

    Returns:
        Hashed password (as string)
    """
    # Convert password to bytes, hash it, and return as string
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash.

    Args:
        plain_password: Plaintext password
        hashed_password: Bcrypt hashed password (as string)

    Returns:
        True if password matches, False otherwise
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


class AuthService:
    """Authentication service for user management"""

    def __init__(self, db: Session):
        """
        Initialize auth service.

        Args:
            db: SQLModel database session
        """
        self.db = db

    def register(self, email: str, password: str) -> tuple[User, str]:
        """
        Register a new user.

        Args:
            email: User's email address
            password: User's password (plaintext)

        Returns:
            Tuple of (User, JWT token)

        Raises:
            ValidationError: If email/password validation fails
            AuthenticationError: If email already registered
        """
        # Validate input
        email = validate_email(email)
        validate_password(password)

        # Check if email already exists
        existing_user = self.db.exec(
            select(User).where(User.email == email)
        ).first()

        if existing_user:
            raise AuthenticationError("Email already registered")

        # Hash password
        password_hash = hash_password(password)

        # Create user
        user = User(
            email=email,
            password_hash=password_hash,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Create JWT token
        token = create_access_token(str(user.id))

        # Create session in database
        session = SessionModel(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        self.db.add(session)
        self.db.commit()

        # Emit USER_REGISTERED event
        event_emitter.emit(
            event_type="USER_REGISTERED",
            user_id=user.id,
            payload={
                "email": user.email,
                "created_at": user.created_at.isoformat(),
            },
        )

        return user, token

    def login(self, email: str, password: str) -> tuple[User, SessionModel, str]:
        """
        Authenticate user and create session.

        Args:
            email: User's email address
            password: User's password (plaintext)

        Returns:
            Tuple of (User, Session, JWT token)

        Raises:
            AuthenticationError: If credentials are invalid
        """
        # Normalize email
        email = email.strip().lower()

        # Find user by email
        user = self.db.exec(
            select(User).where(User.email == email)
        ).first()

        if not user:
            raise AuthenticationError("Invalid email or password")

        # Verify password
        if not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        # Create JWT token
        token = create_access_token(str(user.id))

        # Create session in database
        session = SessionModel(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)

        # Emit USER_LOGGED_IN event
        event_emitter.emit(
            event_type="USER_LOGGED_IN",
            user_id=user.id,
            payload={
                "email": user.email,
                "session_id": str(session.id),
            },
        )

        return user, session, token

    def logout(self, token: str) -> None:
        """
        Logout user by invalidating session.

        Args:
            token: JWT token from cookie

        Raises:
            AuthenticationError: If session not found
        """
        # Find active session by token
        session = self.db.exec(
            select(SessionModel).where(
                SessionModel.token == token,
                SessionModel.is_active == True
            )
        ).first()

        if session:
            # Invalidate session
            session.is_active = False
            self.db.add(session)
            self.db.commit()

            # Emit USER_LOGGED_OUT event
            event_emitter.emit(
                event_type="USER_LOGGED_OUT",
                user_id=session.user_id,
                payload={
                    "session_id": str(session.id),
                },
            )

        # Idempotent: succeed even if session not found

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User's UUID

        Returns:
            User object or None if not found
        """
        return self.db.exec(
            select(User).where(User.id == user_id)
        ).first()
