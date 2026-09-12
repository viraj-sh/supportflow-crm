from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.db import DBSession

router = APIRouter()


@router.get("/api", status_code=status.HTTP_200_OK)
def read_root():
    return JSONResponse({
        "name": settings.project_name,
        "version": settings.version,
        "docs_url": "https://github.com/viraj-sh/supportflow-crm",
    })


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: DBSession):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database Unavailable",
        )
