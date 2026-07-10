# backend/database/__init__.py

from .db import get_driver, init_database, close_database
from .queries import (
    # Players
    create_player,
    get_player,
    get_all_players,
    update_player,
    delete_player,
    # Sessions
    create_session,
    get_session,
    get_sessions_by_player,
    get_all_sessions,
    update_session,
    delete_session,
    # Stats
    get_player_stats,
)

__all__ = [
    "get_driver",
    "init_database",
    "close_database",
    "create_player",
    "get_player",
    "get_all_players",
    "update_player",
    "delete_player",
    "create_session",
    "get_session",
    "get_sessions_by_player",
    "get_all_sessions",
    "update_session",
    "delete_session",
    "get_player_stats",
]
