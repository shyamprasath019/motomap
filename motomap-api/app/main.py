from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.bikes import router as bikes_router
from app.routes.contributions import router as contributions_router
from app.routes.diagnose import router as diagnose_router
from app.routes.guides import router as guides_router
from app.routes.health import router as health_router
from app.routes.parts import router as parts_router
from app.routes.users import router as users_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    assert settings.jwt_secret != "changeme-dev-secret-32-chars-min!!", (
        "JWT_SECRET must be overridden in .env before running"
    )
    yield


app = FastAPI(
    title="Motomap API",
    version="1.0.0",
    description="India's first interactive motorcycle knowledge and diagnostic platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(bikes_router, prefix=settings.api_v1_prefix)
app.include_router(parts_router, prefix=settings.api_v1_prefix)
app.include_router(guides_router, prefix=settings.api_v1_prefix)
app.include_router(contributions_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)
app.include_router(diagnose_router, prefix=settings.api_v1_prefix)
