from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.core.db import Base, engine
from app.routes import system, ticket


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.project_name,
    description=settings.project_name,
    version=settings.version,
    lifespan=lifespan,
)

app.include_router(router=system.router, prefix="", tags=["system"])
app.include_router(router=ticket.router, prefix="", tags=["ticket"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=5001, reload=True)
