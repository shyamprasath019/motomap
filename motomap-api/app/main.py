from fastapi import FastAPI

from app.routes.health import router as health_router

app = FastAPI(
    title="Motomap API",
    version="1.0.0",
    description="India's first interactive motorcycle knowledge and diagnostic platform.",
)

app.include_router(health_router)
