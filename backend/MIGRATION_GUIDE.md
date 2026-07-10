# 📦 CricSense Backend - Laptop Migration Guide

**Purpose**: Complete guide for moving the CricSense project to a different laptop (e.g., from dev laptop to Snapdragon X Elite demo laptop)

---

## 🎯 Quick Overview

**What needs to be moved**:
- ✅ Source code (`backend/`, `cricsense/`, `HowToBuild 2.md`)
- ✅ Database files (`backend/data/*.json`)
- ❌ Virtual environment (`.venv`) - **Do NOT copy**, must recreate

**Estimated Time**: 15-20 minutes

---

## 📋 Pre-Migration Checklist

### On Source Laptop (Current)

- [ ] Ensure all code is saved and committed
- [ ] Backup database files (`backend/data/`)
- [ ] Note any custom configurations in `config.py`
- [ ] Document any installed system dependencies

### On Target Laptop (New)

- [ ] Windows 11 installed (ARM64 or x64)
- [ ] Python 3.10+ installed (3.14 recommended)
- [ ] Internet connection (for pip installs)
- [ ] Admin rights (for package installations)

---

## 🚀 Migration Steps

### Step 1: Copy Project Files

**Option A: USB Drive**
```powershell
# On source laptop
Copy-Item -Recurse C:\Users\aditya.raikar\Desktop\CricSense E:\CricSense_Backup

# On target laptop
Copy-Item -Recurse E:\CricSense_Backup C:\Users\<NEW_USERNAME>\Desktop\CricSense
```

**Option B: Cloud Storage** (OneDrive, Google Drive, etc.)
1. Zip the project folder (exclude `.venv`)
2. Upload to cloud storage
3. Download on target laptop
4. Extract to desired location

**Option C: Git Repository** (Recommended for version control)
```powershell
# On source laptop
cd C:\Users\aditya.raikar\Desktop\CricSense
git init
git add .
git commit -m "Initial commit"
git remote add origin <YOUR_REPO_URL>
git push -u origin main

# On target laptop
cd C:\Users\<NEW_USERNAME>\Desktop
git clone <YOUR_REPO_URL> CricSense
```

**Important**: Do NOT copy the `.venv` folder - it will not work on another machine!

---

### Step 2: Verify Python Installation

```powershell
# Check Python version
python --version

# Should show Python 3.10 or higher
# If not installed, download from https://www.python.org/downloads/
```

---

### Step 3: Create New Virtual Environment

```powershell
# Navigate to project root
cd C:\Users\<NEW_USERNAME>\Desktop\CricSense

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
```

**Troubleshooting**:
- If activation fails with security error:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

### Step 4: Install Backend Dependencies

```powershell
# Navigate to backend folder
cd backend

# Install all dependencies
pip install fastapi uvicorn websockets tinydb aiofiles python-multipart python-dateutil

# Verify installation
pip list | Select-String "fastapi|uvicorn|websockets|tinydb"
```

**Expected output**:
```
aiofiles                25.1.0
fastapi                 0.139.0
python-dateutil         2.9.0.post0
python-multipart        0.0.32
tinydb                  4.8.2
uvicorn                 0.51.0
websockets              16.0
```

---

### Step 5: Install cricsense Backend Dependencies

```powershell
# Navigate to cricsense folder
cd ..\cricsense

# Install requirements
pip install -r requirements.txt

# This installs:
# - numpy (for calculations)
# - opencv-python (for video processing)
# - mediapipe (for pose estimation)
# - requests (for API calls)
# - pyserial (for Arduino communication)
# - etc.
```

---

### Step 6: Test Backend Server

```powershell
# Navigate to backend folder
cd ..\backend

# Start server
python main.py
```

**Expected output**:
```
============================================================
CricSense Backend API Server Starting...
============================================================
[Database] Initialized TinyDB at C:\Users\...\backend\data
[Database] Players: X records
[Database] Sessions: Y records
[Storage] Initialized storage directories
[WebSocket] Starting server on ws://0.0.0.0:8766
[API] REST API available at http://0.0.0.0:5000
[API] OpenAPI docs at http://0.0.0.0:5000/docs
============================================================
Backend ready for connections!
============================================================
[WebSocket] Broadcast loop started
[Bridge] Backend bridge initialized
[WebSocket] Server listening on ws://0.0.0.0:8766
Uvicorn running on http://0.0.0.0:5000 (Press CTRL+C to quit)
```

---

### Step 7: Test API Endpoints

**Test Health Check**:
```powershell
# Open new terminal (keep server running in first terminal)
Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected**: `{"status":"ok","message":"CricSense Backend API is running"}`

**Test Status**:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/status -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected**: `{"devices":{"arduino":false,"phone":false,"npu":false,"cloud":false},"wsConnected":true,...}`

---

### Step 8: Verify Database Migration

```powershell
# Check if data files exist
Get-ChildItem C:\Users\<NEW_USERNAME>\Desktop\CricSense\backend\data

# Should show:
# - players.json
# - sessions.json
# - recordings\ (folder)
```

If you copied existing database files, they should contain your previous data. If not, the backend will create empty databases automatically.

---

## 🔧 Configuration Changes

### Update Paths in config.py (if needed)

If you changed the project location, check `backend/config.py`:

```python
# These paths are relative, so they should work automatically
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
RECORDINGS_DIR = DATA_DIR / "recordings"
```

**No changes needed** if using relative paths (which we are).

---

## 🌐 Network Configuration

### Firewall Rules

If other devices (phone, Arduino) need to connect, add firewall rules:

```powershell
# Allow incoming connections on port 5000 (REST API)
New-NetFirewallRule -DisplayName "CricSense Backend API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Allow incoming connections on port 8766 (WebSocket)
New-NetFirewallRule -DisplayName "CricSense WebSocket" -Direction Inbound -LocalPort 8766 -Protocol TCP -Action Allow

# Allow incoming connections on port 8765 (Phone receiver - cricsense backend)
New-NetFirewallRule -DisplayName "CricSense Phone Receiver" -Direction Inbound -LocalPort 8765 -Protocol TCP -Action Allow
```

### Get IP Address

```powershell
# Get laptop's IP address for phone connection
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
```

Use this IP address in your phone app and Arduino configuration.

---

## 🐛 Troubleshooting

### Issue 1: Python Not Found

**Error**: `python : The term 'python' is not recognized`

**Fix**:
1. Install Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart PowerShell

---

### Issue 2: Virtual Environment Activation Fails

**Error**: `cannot be loaded because running scripts is disabled`

**Fix**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Issue 3: Port Already in Use

**Error**: `[Errno 10048] only one usage of each socket address is normally permitted`

**Fix**:
```powershell
# Kill process using port 5000
$process = Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess
Stop-Process -Id $process -Force

# Kill process using port 8766
$process = Get-NetTCPConnection -LocalPort 8766 | Select-Object -ExpandProperty OwningProcess
Stop-Process -Id $process -Force
```

---

### Issue 4: Dependencies Installation Fails

**Error**: `Could not find a version that satisfies the requirement`

**Fix**:
```powershell
# Update pip first
python -m pip install --upgrade pip

# Try installing again
pip install fastapi uvicorn websockets tinydb aiofiles python-multipart python-dateutil
```

---

### Issue 5: Database Files Missing

**Error**: `[Database] Players: 0 records, Sessions: 0 records`

**This is normal** if you're starting fresh. If you want to restore old data:

1. Copy `players.json` and `sessions.json` from backup
2. Place them in `backend/data/`
3. Restart backend server

---

## 📊 Verification Checklist

After migration, verify everything works:

- [ ] Backend server starts without errors
- [ ] Health endpoint returns OK (`GET /api/health`)
- [ ] Status endpoint returns system status (`GET /api/status`)
- [ ] Can create a test player (`POST /api/players`)
- [ ] Can start a test session (`POST /api/sessions/start`)
- [ ] WebSocket server accepts connections (port 8766)
- [ ] Database files are created in `backend/data/`
- [ ] Logs show no errors

---

## 📝 Environment Variables (Optional)

For production deployment, consider using environment variables:

**Create `.env` file** in backend folder:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=5000

# WebSocket Configuration
WS_HOST=0.0.0.0
WS_PORT=8766

# Feature Flags
DEBUG=False
ENABLE_MOCK_MODE=False
ENABLE_RECORDINGS=True
ENABLE_CLOUD_REPORTS=True
```

**Load in config.py**:
```python
import os
from dotenv import load_dotenv

load_dotenv()

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 5000))
```

---

## 🔄 Quick Start Script

**Create `start_backend.ps1`** in backend folder:

```powershell
#!/usr/bin/env powershell

Write-Host "🏏 Starting CricSense Backend..." -ForegroundColor Cyan

# Navigate to project root
$projectRoot = Split-Path -Parent $PSScriptRoot
cd $projectRoot

# Check if venv exists
if (-not (Test-Path ".venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
pip install -q fastapi uvicorn websockets tinydb aiofiles python-multipart python-dateutil

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Green
cd backend
python main.py
```

**Usage**:
```powershell
.\backend\start_backend.ps1
```

---

## 🎉 Success Criteria

Your migration is successful when:

✅ Backend server starts on both ports (5000, 8766)  
✅ Health endpoint responds with status "ok"  
✅ Can create/list players  
✅ Can start/end sessions  
✅ WebSocket accepts connections  
✅ Database persists data  
✅ Logs show no errors  

---

## 📞 Support

If issues persist:

1. Check [TEST_RESULTS.md](TEST_RESULTS.md) for known issues
2. Check [README.md](README.md) for API documentation
3. Check [INSTALL.md](INSTALL.md) for installation details
4. Review logs in terminal output
5. Check firewall/antivirus settings

---

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:5000/docs (when server is running)
- **Project Documentation**: [HowToBuild 2.md](../HowToBuild%202.md)
- **Test Results**: [TEST_RESULTS.md](TEST_RESULTS.md)
- **Installation Guide**: [INSTALL.md](INSTALL.md)

---

**Migration Complete! Your CricSense backend is ready to go! 🚀**
