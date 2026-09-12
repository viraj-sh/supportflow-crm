from fastapi import FastAPI

from app.routes import system
from app.core.config import settings

app = FastAPI(
    title=settings.project_name,
    description=settings.project_name,
    version=settings.version,
)

app.include_router(router=system.router, prefix="", tags=["system"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=5001, reload=True)
