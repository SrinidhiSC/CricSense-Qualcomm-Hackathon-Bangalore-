# INSTALL.md - Installation Guide for CricSense Backend

## Prerequisites

1. **Python 3.10 (x64)** - Must be x64 architecture for Snapdragon compatibility
2. **Windows 11 ARM64** - Snapdragon X Elite device
3. **Existing cricsense backend** - Located in `../cricsense/`

## Installation Steps

### 1. Activate Virtual Environment

The backend uses the same virtual environment as the existing cricsense backend:

```powershell
# Navigate to project root
cd c:\Users\aditya.raikar\Desktop\CricSense

# Activate Toolbox A venv (x64 Python 3.10)
.\cricsense\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
# Navigate to backend directory
cd backend

# Install requirements
pip install -r requirements.txt
```

This will install:
- fastapi==0.104.1
- uvicorn==0.24.0
- websockets==12.0
- tinydb==4.8.0
- pydantic==2.5.0
- aiofiles==23.2.1
- python-multipart==0.0.6

### 3. Verify Installation

```powershell
# Check Python version (should be 3.10.x x64)
python --version

# Verify packages
pip list | Select-String "fastapi|uvicorn|websockets|tinydb"
```

### 4. Run the Backend

```powershell
# Option 1: Direct run
python main.py

# Option 2: Use startup script
.\run.ps1
```

### 5. Verify Backend is Running

Open your browser to:
- **API Docs**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/api/health

You should see:
```
REST API: http://0.0.0.0:5000
OpenAPI docs: http://0.0.0.0:5000/docs
WebSocket: ws://0.0.0.0:8766
Backend ready for connections!
```

## Testing the API

### Test Health Endpoint

```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CricSense Backend API is running"
}
```

### Test Player Creation

```powershell
curl -X POST "http://localhost:5000/api/players" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "name=TestPlayer&age=25&hand=right&skillLevel=Amateur&avatarIndex=0"
```

### Test WebSocket Connection

Using JavaScript:
```javascript
const ws = new WebSocket('ws://localhost:8766');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (event) => console.log('Frame:', JSON.parse(event.data));
```

## Troubleshooting

### Port Already in Use

If port 5000 or 8766 is already in use:

```powershell
# Check what's using the port
Get-NetTCPConnection -LocalPort 5000

# Kill the process
Stop-Process -Id <PID>
```

Or change the ports in `config.py`:
```python
API_PORT = 5001  # Change to different port
WS_PORT = 8767   # Change to different port
```

### Virtual Environment Not Found

If the venv path is incorrect, create a new one:

```powershell
# Create new venv
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Import Errors

If you get `ModuleNotFoundError`:

```powershell
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Verify all packages installed
pip check
```

### Database Errors

If TinyDB errors occur:

```powershell
# Delete existing database files
Remove-Item data\*.json -Force

# Restart backend (databases will be recreated)
python main.py
```

## Next Steps

1. **Connect Frontend**: Start the React frontend to connect to the backend
2. **Test Integration**: Verify WebSocket data flow
3. **Run cricsense Backend**: Start the existing Python backend for data processing
4. **Test Full Pipeline**: Test end-to-end with Arduino and phone data

## Configuration

Edit `config.py` to customize:

```python
# Change ports
API_PORT = 5000
WS_PORT = 8766

# Enable debug mode
DEBUG = True

# Feature flags
ENABLE_MOCK_MODE = True
ENABLE_RECORDINGS = True
ENABLE_CLOUD_REPORTS = True
```

## Directory Structure After Installation

```
backend/
├── main.py
├── config.py
├── requirements.txt
├── README.md
├── INSTALL.md
├── run.ps1
├── api/
├── models/
├── database/
├── websocket/
├── bridge/
├── storage/
└── data/              # Created on first run
    ├── players.json   # TinyDB database
    ├── sessions.json  # TinyDB database
    └── recordings/    # Video files
```

## Support

For issues or questions, check:
1. Logs in the terminal
2. API docs at http://localhost:5000/docs
3. Backend README.md
4. Project documentation in HowToBuild 2.md
