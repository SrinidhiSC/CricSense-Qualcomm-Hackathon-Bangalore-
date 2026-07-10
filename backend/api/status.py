# backend/api/status.py - System status endpoints

from fastapi import APIRouter
from models import DeviceStatus

router = APIRouter(prefix="/api", tags=["Status"])


@router.get("/status")
async def get_system_status():
    """
    Get system status including device connections and active session.
    
    Returns:
    - Device connection status (Arduino, phone, NPU, cloud)
    - WebSocket connection status
    - Active session ID (if any)
    - Backend version
    """
    # Import bridge to get real-time device status
    from bridge.backend_bridge import get_device_status, get_active_session
    
    devices = get_device_status()
    active_session = get_active_session()
    
    return {
        "devices": {
            "arduino": devices.arduino,
            "phone": devices.phone,
            "npu": devices.npu,
            "cloud": devices.cloud,
        },
        "wsConnected": True,  # If this endpoint responds, WS server is running
        "activeSession": active_session,
        "backendVersion": "1.0.0",
    }


@router.get("/health")
async def health_check():
    """
    Simple health check endpoint.
    
    Returns 200 OK if the API server is running.
    """
    return {"status": "ok", "message": "CricSense Backend API is running"}
