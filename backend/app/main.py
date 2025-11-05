from __future__ import annotations

from fastapi import FastAPI

from .routes import alerts, health, items, staff, threads, uploads


def create_app() -> FastAPI:
    app = FastAPI(title="Lost & Found API", version="0.1.0")

    app.include_router(health.router)
    app.include_router(items.router, prefix="/items", tags=["items"])
    app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
    app.include_router(threads.router, prefix="/threads", tags=["threads"])
    app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
    app.include_router(staff.router, prefix="/staff", tags=["staff"])

    return app


app = create_app()
