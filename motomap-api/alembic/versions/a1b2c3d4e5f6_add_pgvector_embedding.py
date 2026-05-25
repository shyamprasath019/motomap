"""add_pgvector_embedding

Revision ID: a1b2c3d4e5f6
Revises: c4ae4cc6b2bc
Create Date: 2026-05-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "c4ae4cc6b2bc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("ALTER TABLE parts ADD COLUMN IF NOT EXISTS embedding vector(384)")
    # IVFFlat index for approximate nearest-neighbour search (cosine distance)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_parts_embedding "
        "ON parts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_parts_embedding")
    op.execute("ALTER TABLE parts DROP COLUMN IF EXISTS embedding")
