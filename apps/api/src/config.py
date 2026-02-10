"""
Configuration and Environment Variable Validation
Phase 2 Core Infrastructure
"""
import os
from typing import Optional


class ConfigurationError(Exception):
    """Raised when required environment variables are missing"""

    pass


def validate_environment() -> None:
    """
    Validate that all required environment variables are set.

    Raises:
        ConfigurationError: If any required environment variable is missing
    """
    required_vars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "ALLOWED_ORIGINS"]
    missing = [var for var in required_vars if not os.getenv(var)]

    if missing:
        raise ConfigurationError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please create a .env file in apps/api/ with these variables.\n"
            f"See .env.example for template."
        )


def get_database_url() -> str:
    """Get database connection URL from environment"""
    return os.getenv("DATABASE_URL", "")


def get_auth_secret() -> str:
    """Get authentication secret for JWT signing"""
    return os.getenv("BETTER_AUTH_SECRET", "")


def get_allowed_origins() -> list[str]:
    """Get allowed CORS origins as list"""
    origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    return [origin.strip() for origin in origins.split(",")]


def get_jwt_expiration_days() -> int:
    """Get JWT token expiration in days (default: 7)"""
    return int(os.getenv("JWT_EXPIRATION_DAYS", "7"))


def get_log_level() -> str:
    """Get log level (default: info)"""
    return os.getenv("LOG_LEVEL", "info").lower()


def get_enable_habits_module() -> bool:
    """Get habits module feature flag (default: true for Phase 2+)"""
    return os.getenv("ENABLE_HABITS_MODULE", "true").lower() == "true"
