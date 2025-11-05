from .alerts import router as alerts_router
from .health import router as health_router
from .items import router as items_router
from .staff import router as staff_router
from .threads import router as threads_router
from .uploads import router as uploads_router

__all__ = [
    "alerts_router",
    "health_router",
    "items_router",
    "staff_router",
    "threads_router",
    "uploads_router",
]
