from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Offline AI Workspace backend is healthy."}
