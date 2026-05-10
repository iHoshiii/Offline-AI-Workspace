from fastapi import FastAPI
from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.db.sqlite_client import init_db
from app.core.logger import logger

app = FastAPI(
    title="Offline AI Workspace API",
    description="Lightweight local AI backend for low-end systems.",
    version="0.1.0",
)

from fastapi.responses import RedirectResponse

app.include_router(health_router)
app.include_router(chat_router)

@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("Initializing database and backend services...")
    await init_db()
    logger.info("Startup complete.")
