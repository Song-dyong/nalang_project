"""Switch to ORM-based user_interest / user_language / gender models

Revision ID: e89f3165c067
Revises: fe0067e009c1
Create Date: 2025-07-16 17:41:44.546693

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e89f3165c067'
down_revision: Union[str, Sequence[str], None] = 'fe0067e009c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('genders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('code')
    )
    op.create_table('interests',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_interests_id'), 'interests', ['id'], unique=False)
    op.create_table('languages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('code')
    )
    op.create_table('gender_translations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('gender_id', sa.Integer(), nullable=True),
    sa.Column('locale', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['gender_id'], ['genders.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('gender_id', 'locale', name='uq_gender_locale')
    )
    op.create_table('interest_translations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('interest_id', sa.Integer(), nullable=True),
    sa.Column('locale', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['interest_id'], ['interests.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('interest_id', 'locale', name='uq_interest_locale')
    )
    op.create_table('language_translations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('language_id', sa.Integer(), nullable=True),
    sa.Column('locale', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['language_id'], ['languages.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('language_id', 'locale', name='uq_language_locale')
    )
    op.create_table('user_genders',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('gender_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['gender_id'], ['genders.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'gender_id')
    )
    op.create_table('user_interests',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('interest_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['interest_id'], ['interests.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'interest_id')
    )
    op.create_table('user_languages',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('language_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['language_id'], ['languages.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'language_id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_languages')
    op.drop_table('user_interests')
    op.drop_table('user_genders')
    op.drop_table('language_translations')
    op.drop_table('interest_translations')
    op.drop_table('gender_translations')
    op.drop_table('languages')
    op.drop_index(op.f('ix_interests_id'), table_name='interests')
    op.drop_table('interests')
    op.drop_table('genders')
    # ### end Alembic commands ###
