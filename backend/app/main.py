import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.db import Base, engine
from app.core.utils import static_path
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

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
static_dir = static_path()
app.include_router(router=system.router, prefix="/api", tags=["system"])
app.include_router(router=ticket.router, prefix="/api", tags=["ticket"])


print(
    f"static_dir -> {static_dir} | exists? -> {os.path.isdir(static_dir)} | index.html exists? -> {os.path.isfile(os.path.join(static_dir, 'index.html'))}"
)

if os.path.isdir(static_dir) and os.path.isfile(os.path.join(static_dir, "index.html")):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(static_dir, "index.html"))
