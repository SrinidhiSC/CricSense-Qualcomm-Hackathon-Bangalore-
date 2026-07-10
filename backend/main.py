# backend/main.py - FastAPI application entry point

"""
CricSense Backend API Server

This server provides:
1. REST API endpoints for player/session/recording management
2. WebSocket server for real-time frame broadcasting to frontend
3. Bridge to existing cricsense backend for data processing

Architecture:
- FastAPI REST API (port 5000)
- WebSocket broadcast server (port 8766)
- Bridge to cricsense backend (shared queue communication)
- TinyDB for data persistence

Usage:
    python main.py
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import config
from api import (
    players_router,
    sessions_router,
    recordings_router,
    reports_router,
    sarvam_router,
    status_router,
)
from database import init_database, close_database
from storage import init_storage
from websocket import start_websocket_server

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup/shutdown tasks.
    
    Startup:
    - Initialize database
    - Initialize storage directories
    - Start WebSocket server
    
    Shutdown:
    - Close database connections
    """
    # Startup
    logger.info("=" * 60)
    logger.info("CricSense Backend API Server Starting...")
    logger.info("=" * 60)
    
    # Initialize database
    init_database()
    
    # Initialize storage
    init_storage()
    
    # Start WebSocket server in background
    logger.info(f"[WebSocket] Starting server on ws://{config.WS_HOST}:{config.WS_PORT}")
    ws_task = asyncio.create_task(start_websocket_server())
    # Store task to prevent garbage collection
    app.state.ws_task = ws_task
    
    logger.info(f"[API] REST API available at http://{config.API_HOST}:{config.API_PORT}")
    logger.info(f"[API] OpenAPI docs at http://{config.API_HOST}:{config.API_PORT}/docs")
    logger.info("=" * 60)
    logger.info("Backend ready for connections!")
    logger.info("=" * 60)
    
    yield
    
    # Shutdown
    logger.info("Shutting down backend...")
    close_database()
    logger.info("Shutdown complete.")


# Create FastAPI app
app = FastAPI(
    title="CricSense Backend API",
    description="Backend API for CricSense AI Cricket Coaching System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(players_router)
app.include_router(sessions_router)
app.include_router(recordings_router)
app.include_router(reports_router)
app.include_router(sarvam_router)
app.include_router(status_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CricSense Backend API",
        "version": "1.0.0",
        "status": "running",
        "docs": f"http://{config.API_HOST}:{config.API_PORT}/docs",
    }


def main():
    """Main entry point"""
    uvicorn.run(
        "main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=config.DEBUG,
        log_level="info",
    )


if __name__ == "__main__":
    main()
