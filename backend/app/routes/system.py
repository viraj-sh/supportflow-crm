from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.config import settings

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, tags=["system"])
def read_root():
    return JSONResponse({
        "name": settings.project_name,
        "version": settings.version,
        "docs_url": "https://github.com/viraj-sh/supportflow-crm",
    })
