from fastapi import FastAPI

from app.config import settings
from app.routes.bikes import router as bikes_router
from app.routes.contributions import router as contributions_router
from app.routes.guides import router as guides_router
from app.routes.health import router as health_router
from app.routes.parts import router as parts_router
from app.routes.users import router as users_router

app = FastAPI(
    title="Motomap API",
    version="1.0.0",
    description="India's first interactive motorcycle knowledge and diagnostic platform.",
)

app.include_router(health_router)
app.include_router(bikes_router, prefix=settings.api_v1_prefix)
app.include_router(parts_router, prefix=settings.api_v1_prefix)
app.include_router(guides_router, prefix=settings.api_v1_prefix)
app.include_router(contributions_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)
