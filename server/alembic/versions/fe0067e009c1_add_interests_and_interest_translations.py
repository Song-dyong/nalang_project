"""add interests and interest_translations

Revision ID: fe0067e009c1
Revises: 2d28cd843cfd
Create Date: 2025-07-16 15:51:47.909258

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe0067e009c1'
down_revision: Union[str, Sequence[str], None] = '2d28cd843cfd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('interests',
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('name')
    )
    op.create_table('interest_translations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('interest_name', sa.String(), nullable=True),
    sa.Column('locale', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['interest_name'], ['interests.name'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('interest_name', 'locale', name='uq_interest_locale')
    )
    op.create_table('user_interests',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('interest_name', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['interest_name'], ['interests.name'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'interest_name')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_interests')
    op.drop_table('interest_translations')
    op.drop_table('interests')
    # ### end Alembic commands ###
