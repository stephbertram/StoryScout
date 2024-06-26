"""postgresql creation

Revision ID: 0b020c0a0608
Revises: 
Create Date: 2024-05-09 13:44:13.386569

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0b020c0a0608'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('books',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=100), nullable=False),
    sa.Column('author', sa.String(length=50), nullable=False),
    sa.Column('cover_photo', sa.String(), nullable=False),
    sa.Column('page_count', sa.Integer(), nullable=False),
    sa.Column('topic', sa.String(), nullable=False),
    sa.Column('description', sa.String(length=5000), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('_password_hash', sa.String(), nullable=False),
    sa.Column('profile_image', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('reviews',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=True),
    sa.Column('review', sa.String(), nullable=True),
    sa.Column('rec_age', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('book_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['book_id'], ['books.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('stacks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('book_stacks',
    sa.Column('book_id', sa.Integer(), nullable=False),
    sa.Column('stack_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['book_id'], ['books.id'], ),
    sa.ForeignKeyConstraint(['stack_id'], ['stacks.id'], ),
    sa.PrimaryKeyConstraint('book_id', 'stack_id')
    )
    with op.batch_alter_table('book_stacks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_book_stacks_book_id'), ['book_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_book_stacks_stack_id'), ['stack_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('book_stacks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_book_stacks_stack_id'))
        batch_op.drop_index(batch_op.f('ix_book_stacks_book_id'))

    op.drop_table('book_stacks')
    op.drop_table('stacks')
    op.drop_table('reviews')
    op.drop_table('users')
    op.drop_table('books')
    # ### end Alembic commands ###
