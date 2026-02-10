"""Create habits and habit_completions tables for Phase 2 Chunk 3

Revision ID: 003
Revises: 002
Create Date: 2026-02-10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create habits and habit_completions tables with indexes, constraints, and triggers"""

    # Create habits table
    op.create_table(
        'habits',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column(
            'user_id',
            UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True
        ),
        # Core Atomic Habits Fields
        sa.Column('identity_statement', sa.Text(), nullable=False),
        sa.Column('full_description', sa.Text(), nullable=True),
        sa.Column('two_minute_version', sa.Text(), nullable=False),
        # Habit Stacking (Law 1)
        sa.Column('habit_stacking_cue', sa.Text(), nullable=True),
        sa.Column(
            'anchor_habit_id',
            UUID(as_uuid=True),
            sa.ForeignKey('habits.id', ondelete='SET NULL'),
            nullable=True
        ),
        # Motivation & Organization
        sa.Column('motivation', sa.Text(), nullable=True),
        sa.Column('category', sa.VARCHAR(50), nullable=False),
        # Scheduling (JSONB for flexibility)
        sa.Column('recurring_schedule', JSONB, nullable=False),
        # Status Management
        sa.Column('status', sa.VARCHAR(20), nullable=False, server_default='active'),
        # Tracking Fields (Phase 2 Chunk 4)
        sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_completed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('consecutive_misses', sa.Integer(), nullable=False, server_default='0'),
        # Timestamps
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
        # Constraints
        sa.CheckConstraint(
            "char_length(trim(identity_statement)) > 0",
            name='check_identity_not_empty'
        ),
        sa.CheckConstraint(
            "char_length(identity_statement) <= 2000",
            name='check_identity_max_length'
        ),
        sa.CheckConstraint(
            "char_length(trim(two_minute_version)) > 0",
            name='check_two_minute_not_empty'
        ),
        sa.CheckConstraint(
            "char_length(two_minute_version) <= 500",
            name='check_two_minute_max_length'
        ),
        sa.CheckConstraint(
            "status IN ('active', 'archived')",
            name='check_status_valid'
        ),
        sa.CheckConstraint(
            "category IN ('Health & Fitness', 'Productivity', 'Mindfulness', "
            "'Learning', 'Social', 'Finance', 'Creative', 'Other')",
            name='check_category_valid'
        )
    )

    # Create performance indexes for habits table
    op.create_index('idx_habits_user_id', 'habits', ['user_id'])
    op.create_index('idx_habits_user_status', 'habits', ['user_id', 'status'])
    op.create_index('idx_habits_user_category', 'habits', ['user_id', 'category'])
    op.create_index('idx_habits_anchor', 'habits', ['anchor_habit_id'])
    op.create_index(
        'idx_habits_schedule',
        'habits',
        ['recurring_schedule'],
        postgresql_using='gin'
    )

    # Create habit_completions table (Phase 2 Chunk 4 preparation)
    op.create_table(
        'habit_completions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column(
            'habit_id',
            UUID(as_uuid=True),
            sa.ForeignKey('habits.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.Column(
            'user_id',
            UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.Column(
            'completed_at',
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        ),
        sa.Column('completion_type', sa.VARCHAR(20), nullable=False),
        # Constraints
        sa.CheckConstraint(
            "completion_type IN ('full', 'two_minute')",
            name='check_completion_type_valid'
        )
    )

    # Create indexes for habit_completions table
    op.create_index(
        'idx_completions_habit',
        'habit_completions',
        [sa.text('habit_id'), sa.text('completed_at DESC')]
    )
    op.create_index(
        'idx_completions_user',
        'habit_completions',
        [sa.text('user_id'), sa.text('completed_at DESC')]
    )
    op.create_index('idx_completions_date', 'habit_completions', ['completed_at'])

    # Trigger to auto-update updated_at timestamp for habits
    # (Function already created in 002 migration, just create trigger)
    op.execute("""
        CREATE TRIGGER update_habits_updated_at
        BEFORE UPDATE ON habits
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    """Drop habits and habit_completions tables and triggers"""
    op.execute("DROP TRIGGER IF EXISTS update_habits_updated_at ON habits")
    op.drop_table('habit_completions')
    op.drop_table('habits')
