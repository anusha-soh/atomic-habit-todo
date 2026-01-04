"""Create tasks table for Phase 2 Chunk 2

Revision ID: 002
Revises: 001
Create Date: 2026-01-04
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create tasks table with indexes and triggers"""
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column(
            'user_id',
            UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True
        ),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.VARCHAR(20), nullable=False, server_default='pending'),
        sa.Column('priority', sa.VARCHAR(10), nullable=True),
        sa.Column('tags', ARRAY(sa.Text()), server_default='{}'),
        sa.Column('due_date', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
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
        sa.CheckConstraint(
            "char_length(title) <= 500 AND char_length(trim(title)) > 0",
            name='check_title_valid'
        ),
        sa.CheckConstraint(
            "char_length(description) <= 5000",
            name='check_description_length'
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'in_progress', 'completed')",
            name='check_status_valid'
        ),
        sa.CheckConstraint(
            "priority IN ('high', 'medium', 'low') OR priority IS NULL",
            name='check_priority_valid'
        )
    )

    # Create performance indexes
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_status', 'tasks', ['user_id', 'status'])
    op.create_index('idx_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('idx_tasks_user_due_date', 'tasks', ['user_id', 'due_date'])
    op.create_index(
        'idx_tasks_user_created',
        'tasks',
        [sa.text('user_id'), sa.text('created_at DESC')]
    )
    op.create_index('idx_tasks_tags', 'tasks', ['tags'], postgresql_using='gin')

    # Full-text search index
    op.execute(
        "CREATE INDEX idx_tasks_search ON tasks USING GIN("
        "to_tsvector('english', title || ' ' || COALESCE(description, '')))"
    )

    # Trigger to auto-update updated_at timestamp
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    # Trigger to sync completed flag with status
    op.execute("""
        CREATE OR REPLACE FUNCTION sync_completed_flag()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'completed' THEN
                NEW.completed = TRUE;
            ELSIF NEW.status IN ('pending', 'in_progress') THEN
                NEW.completed = FALSE;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER sync_task_completed
        BEFORE INSERT OR UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION sync_completed_flag();
    """)


def downgrade() -> None:
    """Drop tasks table, triggers, and functions"""
    op.execute("DROP TRIGGER IF EXISTS sync_task_completed ON tasks")
    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")
    op.execute("DROP FUNCTION IF EXISTS sync_completed_flag()")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    op.drop_table('tasks')
