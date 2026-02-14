"""Add habit-task connection columns to tasks table

Revision ID: 005
Revises: 004
Create Date: 2026-02-13
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add generated_by_habit_id and is_habit_task columns to tasks table"""

    # Add generated_by_habit_id FK column (ON DELETE SET NULL)
    op.add_column(
        'tasks',
        sa.Column(
            'generated_by_habit_id',
            UUID(as_uuid=True),
            sa.ForeignKey('habits.id', ondelete='SET NULL'),
            nullable=True
        )
    )

    # Add is_habit_task boolean flag
    op.add_column(
        'tasks',
        sa.Column(
            'is_habit_task',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false')
        )
    )

    # Composite index for idempotent generation checks
    op.create_index(
        'idx_tasks_habit_generated',
        'tasks',
        ['generated_by_habit_id', 'due_date', 'is_habit_task']
    )


def downgrade() -> None:
    """Remove habit-task connection columns from tasks table"""
    op.drop_index('idx_tasks_habit_generated', table_name='tasks')
    op.drop_column('tasks', 'is_habit_task')
    op.drop_column('tasks', 'generated_by_habit_id')
