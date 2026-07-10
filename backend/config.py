# backend/config.py - Backend API configuration

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# FastAPI REST API server
API_HOST = "0.0.0.0"
API_PORT = 5000

# WebSocket server for frontend streaming
WS_HOST = "0.0.0.0"
WS_PORT = 8766
WS_FRAME_RATE = 30  # FPS - broadcast rate to frontend

# CORS - allow React frontend
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Neo4j Graph Database
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# Storage paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Recording storage
RECORDINGS_DIR = DATA_DIR / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)

# ═══════════════════════════════════════════════════════════════════════════
# BACKEND BRIDGE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Connection to existing cricsense backend
CRICSENSE_BACKEND_MODE = "shared_queue"  # "shared_queue" | "websocket" | "subprocess"

# Shared queue size (if mode = shared_queue)
FRAME_QUEUE_SIZE = 100

# Internal WebSocket (if mode = websocket)
INTERNAL_WS_PORT = 8767

# ═══════════════════════════════════════════════════════════════════════════
# SESSION CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Maximum shots to store per session
MAX_SHOTS_PER_SESSION = 500

# Session timeout (auto-end if no activity for X seconds)
SESSION_TIMEOUT_SECONDS = 300  # 5 minutes

# Cloud report timeout
CLOUD_REPORT_TIMEOUT_SECONDS = 60

# ═══════════════════════════════════════════════════════════════════════════
# PHASE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

# Session phases (matches frontend TypeScript SessionPhase type)
class SessionPhase:
    STARTUP = "startup"
    TRACKING = "tracking"
    SHOT_DETECTED = "shot_detected"
    QA_ACTIVE = "qa_active"
    REPORT = "report"

# LLM status (matches frontend TypeScript LLMStatus type)
class LLMStatus:
    IDLE = "idle"
    THINKING = "thinking"
    REPLIED = "replied"

# ═══════════════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════════════

LOG_LEVEL = "INFO"  # DEBUG | INFO | WARNING | ERROR
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# ═══════════════════════════════════════════════════════════════════════════
# FEATURE FLAGS
# ═══════════════════════════════════════════════════════════════════════════

DEBUG = False  # Enable debug mode (auto-reload on code changes)
ENABLE_MOCK_MODE = True  # Enable mock data generation when backend not available
ENABLE_RECORDINGS = True  # Enable video recording storage
ENABLE_CLOUD_REPORTS = True  # Enable Cirrascale Cloud AI 100 reports
