---
paths:
  - "motomap-api/**/*.py"
---

# Backend Conventions (Python / FastAPI)

- Use `async def` for all route handlers and service functions
- SQLAlchemy: always use `AsyncSession`, never `Session`
- Pydantic v2: use `model_validator` not `validator`, `model_fields` not `__fields__`
- Return type hints required on all public functions
- Services must not import from `routes/` — one-way dependency
- Never use `select *` in queries — always specify columns
- Alembic migration files: descriptive names → `add_part_connections_table`
- Log with `structlog`, not `print()` or `logging.basicConfig`
