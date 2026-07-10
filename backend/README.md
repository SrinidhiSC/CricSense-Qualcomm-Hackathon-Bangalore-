# CricSense Backend API

Production-ready FastAPI backend for the CricSense AI Cricket Coaching System.

## 📋 Overview

This backend provides:

1. **REST API** - Player/session/recording management endpoints
2. **WebSocket Server** - Real-time frame broadcasting at 30 FPS to frontend
3. **Backend Bridge** - Connects to existing `cricsense/` Python backend for data processing
4. **TinyDB Storage** - Lightweight JSON database for players and sessions
5. **File Storage** - Session recording video management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React TypeScript Frontend                   │
│                     (Vite + Tailwind + Zustand)                 │
└─────────────────┬──────────────────────┬────────────────────────┘
                  │ REST API             │ WebSocket
                  │ (port 5000)          │ (port 8766)
                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   backend/ (FastAPI + uvicorn)                  │
├─────────────────────────────────────────────────────────────────┤
│  • api/           - REST endpoints                              │
│  • websocket/     - Real-time broadcasting                      │
│  • bridge/        - Connection to cricsense backend             │
│  • database/      - TinyDB CRUD operations                      │
│  • models/        - Pydantic models (matches TypeScript)        │
│  • storage/       - Recording file management                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │ Shared Queue/Memory
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│             cricsense/ (Existing Python Backend)                │
├─────────────────────────────────────────────────────────────────┤
│  • Phone data receiver (port 8765)                             │
│  • Arduino Nano IMU integration                                 │
│  • NPU pose estimation (MediaPipe + QNN)                        │
│  • Shot detection & coaching logic                              │
│  • Sarvam AI (Hindi Q&A + ASR)                                  │
│  • Cloud report generation (Cirrascale)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py               # Configuration (ports, paths, feature flags)
├── requirements.txt        # Python dependencies
│
├── api/                    # REST API endpoints
│   ├── __init__.py
│   ├── players.py          # Player CRUD endpoints
│   ├── sessions.py         # Session start/end/get endpoints
│   ├── recordings.py       # Recording upload/download endpoints
│   ├── reports.py          # Cloud report generation endpoints
│   ├── sarvam.py           # Hindi Q&A and transcription endpoints
│   └── status.py           # System status endpoints
│
├── models/                 # Pydantic models (matches TypeScript)
│   ├── __init__.py
│   ├── frame.py            # WSFrame, Landmark, BatData, Metrics, etc.
│   ├── session.py          # Session, Shot, CloudReport
│   └── player.py           # Player, PlayerStats
│
├── database/               # TinyDB integration
│   ├── __init__.py
│   ├── db.py               # Database initialization
│   └── queries.py          # CRUD operations
│
├── websocket/              # WebSocket server
│   ├── __init__.py
│   ├── server.py           # WebSocket broadcaster (30 FPS)
│   └── frame_builder.py    # WSFrame construction & phase management
│
├── bridge/                 # Bridge to cricsense backend
│   ├── __init__.py
│   └── backend_bridge.py   # Shared queue communication
│
├── storage/                # File storage
│   ├── __init__.py
│   └── recordings.py       # Recording file management
│
└── data/                   # Runtime data (auto-created)
    ├── players.json        # Player database
    ├── sessions.json       # Session database
    └── recordings/         # Session video recordings
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.10 (x64) in Toolbox A virtual environment
- Existing `cricsense/` backend installed
- Windows 11 ARM64 with Snapdragon X Elite

### 2. Install Dependencies

```powershell
# Navigate to backend directory
cd c:\Users\aditya.raikar\Desktop\CricSense\backend

# Activate Toolbox A venv (x64 Python)
c:\Users\aditya.raikar\Desktop\CricSense\cricsense\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 3. Run the Backend

```powershell
# Start the backend server
python main.py
```

This will start:
- **REST API** on http://0.0.0.0:5000
- **OpenAPI docs** on http://0.0.0.0:5000/docs
- **WebSocket server** on ws://0.0.0.0:8766

### 4. Test the API

Open your browser to http://localhost:5000/docs to see the interactive API documentation.

Example API calls:

```bash
# Health check
curl http://localhost:5000/api/health

# Get system status
curl http://localhost:5000/api/status

# Create a player
curl -X POST http://localhost:5000/api/players \
  -d "name=Aditya&age=25&hand=right&skillLevel=Amateur&avatarIndex=0"

# Get all players
curl http://localhost:5000/api/players
```

## 🔌 API Endpoints

### Players

- `GET /api/players` - Get all players
- `GET /api/players/{id}` - Get player by ID
- `POST /api/players` - Create new player
- `PUT /api/players/{id}` - Update player
- `DELETE /api/players/{id}` - Delete player (cascades to sessions)
- `GET /api/players/{id}/stats` - Get aggregated player statistics

### Sessions

- `POST /api/sessions/start` - Start a new session
- `POST /api/sessions/end` - End active session
- `GET /api/sessions` - Get sessions (with pagination & player filter)
- `GET /api/sessions/{id}` - Get session by ID
- `DELETE /api/sessions/{id}` - Delete session
- `POST /api/sessions/{id}/shots` - Add shot to session (called by backend)

### Recordings

- `POST /api/recordings/{sessionId}` - Upload session recording
- `GET /api/recordings/{sessionId}` - Download session recording
- `DELETE /api/recordings/{sessionId}` - Delete recording

### Reports

- `POST /api/reports/generate` - Trigger cloud report generation
- `GET /api/reports/{sessionId}` - Get report status and result

### Sarvam AI

- `POST /api/sarvam/question` - Ask Hindi question and get coaching reply
- `POST /api/sarvam/transcribe` - Transcribe Hindi audio to text

### Status

- `GET /api/status` - Get system and device status
- `GET /api/health` - Health check endpoint

## 🔄 WebSocket Protocol

The WebSocket server broadcasts `WSFrame` objects at 30 FPS.

### Frame Structure

```typescript
interface WSFrame {
  keypoints: Landmark[] | null;  // 33 pose keypoints
  metrics: Metrics;               // Elbow, knee, head angles
  bat: BatData;                   // Swing, wrist, impact
  coaching: CoachingCue | null;   // Coaching feedback
  devices: DeviceStatus;          // Device connections
  sarvam: SarvamExchange | null;  // Hindi Q&A exchange
  phase: SessionPhase;            // Current phase
  llmStatus: LLMStatus;           // LLM status
  pendingQuestion: string | null; // Pending Hindi question
}
```

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8766');

ws.onmessage = (event) => {
  const frame = JSON.parse(event.data);
  console.log('Frame:', frame);
};
```

### Session Phases

1. **startup** - No devices or no player detected
2. **tracking** - Normal operation, tracking pose
3. **shot_detected** - Shot just detected, showing coaching
4. **qa_active** - Hindi question/answer in progress
5. **report** - Session ended, showing report

## 📊 Database Schema

### Players Table (TinyDB)

```python
{
  "id": "uuid",
  "name": "string (1-30 chars)",
  "age": "int (8-60)",
  "hand": "right | left",
  "skillLevel": "Beginner | Amateur | Club | Semi-Pro",
  "avatarIndex": "int (0-5)",
  "createdAt": "timestamp (ms)",
  "sessionIds": ["session_id", ...]
}
```

### Sessions Table (TinyDB)

```python
{
  "id": "uuid",
  "playerId": "uuid",
  "date": "YYYY-MM-DD",
  "startTime": "timestamp (ms)",
  "endTime": "timestamp (ms)",
  "shots": [
    {
      "shotNumber": "int",
      "timestamp": "ms",
      "elbow": "float",
      "knee": "float",
      "head": "float",
      "swingSpeed": "float",
      "wristSnap": "float",
      "coaching": "string",
      "isGoodShot": "boolean"
    }
  ],
  "cloudReport": {
    "section1": "string",
    "section2": "string",
    "section3": "string",
    "section4": "string"
  },
  "recordingKey": "filename.webm | null"
}
```

## ⚙️ Configuration

Edit `config.py` to customize:

```python
# Server ports
API_PORT = 5000
WS_PORT = 8766

# Feature flags
DEBUG = False                   # Enable auto-reload
ENABLE_MOCK_MODE = True         # Mock data when backend unavailable
ENABLE_RECORDINGS = True        # Enable video recording storage
ENABLE_CLOUD_REPORTS = True     # Enable Cirrascale reports

# Session settings
MAX_SHOTS_PER_SESSION = 500
SESSION_TIMEOUT_SECONDS = 300   # 5 minutes
```

## 🔗 Integration with Existing Backend

The `bridge/` module connects to the existing `cricsense/` backend:

1. **Shared Queue** - Backend publishes frame data to queue
2. **Bridge reads queue** - At 30 FPS, reads latest frame data
3. **WebSocket broadcasts** - Sends to all connected frontend clients

### Required Modifications to `cricsense/main.py`

The existing backend needs to publish data to the bridge instead of showing OpenCV UI:

```python
# In cricsense/main.py, replace OpenCV display with:
from backend.bridge import publish_frame_data, update_device_status

# In main loop:
publish_frame_data(
    keypoints=keypoints,
    metrics=metrics,
    bat=bat_data
)
```

## 🐛 Debugging

### Enable Debug Mode

```python
# config.py
DEBUG = True  # Enables auto-reload on code changes
LOG_LEVEL = "DEBUG"
```

### View Logs

The backend logs all operations:

```
2024-01-15 10:30:00 [INFO] [API] REST API available at http://0.0.0.0:5000
2024-01-15 10:30:00 [INFO] [WebSocket] Server listening on ws://0.0.0.0:8766
2024-01-15 10:30:05 [INFO] [WebSocket] Client connected. Total clients: 1
2024-01-15 10:30:10 [INFO] [API] Created player: Aditya (id: abc-123)
```

### Check Database

View the JSON databases directly:

```powershell
# View players
Get-Content backend\data\players.json | ConvertFrom-Json | Format-List

# View sessions
Get-Content backend\data\sessions.json | ConvertFrom-Json | Format-List
```

## 📦 Dependencies

See `requirements.txt` for full list:

- `fastapi==0.104.1` - REST API framework
- `uvicorn==0.24.0` - ASGI server
- `websockets==12.0` - WebSocket server
- `tinydb==4.8.0` - JSON database
- `pydantic==2.5.0` - Data validation
- `aiofiles==23.2.1` - Async file I/O
- `python-multipart==0.0.6` - File upload support

## 🚀 Production Deployment

For production:

1. Set `DEBUG = False` in `config.py`
2. Use proper CORS origins (not `*`)
3. Run with gunicorn + uvicorn workers
4. Use nginx as reverse proxy
5. Enable HTTPS for WebSocket (wss://)
6. Set up systemd service for auto-start

## 📝 License

Part of CricSense - Snapdragon Spaces Hackathon Project

## 🤝 Contributing

This backend is designed to work seamlessly with:
- Existing `cricsense/` Python backend
- React TypeScript frontend
- Snapdragon X Elite NPU hardware
- Arduino Nano IMU sensors

---

**Built with ❤️ for Snapdragon Spaces Hackathon**
