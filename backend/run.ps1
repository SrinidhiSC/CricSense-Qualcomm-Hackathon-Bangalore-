# backend/run.ps1 - Quick startup script

Write-Host "🏏 Starting CricSense Backend API Server..." -ForegroundColor Cyan
Write-Host ""

# Check if venv is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "⚠️  Virtual environment not activated!" -ForegroundColor Yellow
    Write-Host "Activating Toolbox A venv..." -ForegroundColor Yellow
    & "c:\Users\aditya.raikar\Desktop\CricSense\cricsense\venv\Scripts\Activate.ps1"
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pip install -q -r requirements.txt

Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host "   REST API: http://localhost:5000" -ForegroundColor Green
Write-Host "   API Docs: http://localhost:5000/docs" -ForegroundColor Green
Write-Host "   WebSocket: ws://localhost:8766" -ForegroundColor Green
Write-Host ""

# Run the backend
python main.py
