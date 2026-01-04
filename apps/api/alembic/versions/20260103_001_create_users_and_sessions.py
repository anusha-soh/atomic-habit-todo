"""Create users and sessions tables

Revision ID: 001
Revises:
Create Date: 2026-01-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create users and sessions tables"""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column(
            'created_at',
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        ),
        sa.Column(
            'updated_at',
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        ),
    )

    # Create sessions table
    op.create_table(
        'sessions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'user_id',
            UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True
        ),
        sa.Column('token', sa.Text, nullable=False, index=True),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column(
            'created_at',
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        ),
        sa.Column(
            'is_active',
            sa.Boolean,
            nullable=False,
            server_default=sa.true(),
            index=True
        ),
    )


def downgrade() -> None:
    """Drop users and sessions tables"""
    op.drop_table('sessions')
    op.drop_table('users')
