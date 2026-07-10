# backend/api/__init__.py

from .players import router as players_router
from .sessions import router as sessions_router
from .recordings import router as recordings_router
from .reports import router as reports_router
from .sarvam import router as sarvam_router
from .status import router as status_router

__all__ = [
    "players_router",
    "sessions_router",
    "recordings_router",
    "reports_router",
    "sarvam_router",
    "status_router",
]
