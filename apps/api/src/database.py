"""
Database Connection and Session Management
Phase 2 Core Infrastructure
"""
from sqlmodel import create_engine, Session
from contextlib import contextmanager
from typing import Generator

from src.config import get_database_url

# Create database engine
engine = create_engine(get_database_url(), echo=False)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.

    Yields:
        SQLModel database session

    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_session)):
            users = db.exec(select(User)).all()
            return users
    """
    with Session(engine) as session:
        yield session


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions (for non-FastAPI code).

    Yields:
        SQLModel database session

    Example:
        with get_db_session() as db:
            user = db.exec(select(User).where(User.id == user_id)).first()
    """
    with Session(engine) as session:
        yield session
