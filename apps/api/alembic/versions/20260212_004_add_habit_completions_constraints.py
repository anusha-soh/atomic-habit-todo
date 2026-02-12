"""Add missing created_at field and unique constraint to habit_completions

Revision ID: 004
Revises: 003
Create Date: 2026-02-12
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add created_at field and unique constraint to habit_completions table"""

    # Add created_at column
    op.add_column(
        'habit_completions',
        sa.Column(
            'created_at',
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        )
    )

    # Add unique constraint for one completion per habit per day (UTC)
    # Note: This uses a functional index approach compatible with PostgreSQL
    op.create_index(
        'idx_habit_completions_unique_day',
        'habit_completions',
        [sa.text('habit_id'), sa.text("DATE(completed_at AT TIME ZONE 'UTC')")],
        unique=True
    )


def downgrade() -> None:
    """Remove created_at and unique constraint from habit_completions"""
    op.drop_index('idx_habit_completions_unique_day', table_name='habit_completions')
    op.drop_column('habit_completions', 'created_at')
