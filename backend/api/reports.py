# backend/api/reports.py - Cloud report generation endpoints

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from typing import Literal
from pydantic import BaseModel
from models import CloudReport, Session
import database as db


class GenerateReportRequest(BaseModel):
    sessionId: str

router = APIRouter(prefix="/api/reports", tags=["Reports"])


# In-memory store for report generation status
_report_status: dict[str, dict] = {}


async def generate_report_task(session_id: str):
    """Background task to generate cloud report"""
    try:
        # Update status
        _report_status[session_id] = {"status": "processing", "error": None}
        
        # Get session
        session = db.get_session(session_id)
        if not session or not session.shots:
            _report_status[session_id] = {
                "status": "failed",
                "error": "Session not found or no shots"
            }
            return
        
        # Call existing cricsense backend to generate report
        # This will connect to session_report.py in the cricsense folder
        from bridge.backend_bridge import generate_cloud_report
        
        report = await generate_cloud_report(session.shots)
        
        # Save report to session
        db.update_session(session_id, {"cloudReport": report.model_dump()})
        
        # Update status
        _report_status[session_id] = {"status": "completed", "error": None}
        
    except Exception as e:
        _report_status[session_id] = {
            "status": "failed",
            "error": str(e)
        }


@router.post("/generate")
async def trigger_report_generation(
    request: GenerateReportRequest,
    background_tasks: BackgroundTasks
):
    """
    Trigger cloud report generation for a session.
    
    - **sessionId**: Session UUID
    
    Returns report ID and initial status. The actual generation happens asynchronously.
    Use GET /api/reports/{sessionId} to check status and retrieve the completed report.
    """
    session = db.get_session(request.sessionId)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {request.sessionId} not found"
        )
    
    if not session.shots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session has no shots - cannot generate report"
        )
    
    # Initialize status
    _report_status[request.sessionId] = {"status": "processing", "error": None}
    
    # Start background task
    background_tasks.add_task(generate_report_task, request.sessionId)
    
    return {
        "reportId": request.sessionId,
        "status": "processing",
        "estimatedTime": 10,  # seconds
    }


@router.get("/{session_id}")
async def get_report_status(session_id: str):
    """
    Get cloud report status and result.
    
    - **session_id**: Session UUID
    
    Returns:
    - **status**: "completed" | "processing" | "failed"
    - **report**: CloudReport object (only if status is "completed")
    - **error**: Error message (only if status is "failed")
    """
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    # Check if report exists in session
    if session.cloudReport:
        return {
            "status": "completed",
            "report": session.cloudReport,
            "error": None,
        }
    
    # Check generation status
    if session_id in _report_status:
        status_info = _report_status[session_id]
        return {
            "status": status_info["status"],
            "report": None,
            "error": status_info.get("error"),
        }
    
    # No report and no generation in progress
    return {
        "status": "not_started",
        "report": None,
        "error": None,
    }
