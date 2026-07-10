# backend/api/sessions.py - Session management endpoints

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import uuid

from models import Session, Shot
import database as db


class StartSessionRequest(BaseModel):
    playerId: str


class EndSessionRequest(BaseModel):
    sessionId: str

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])


@router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_session(request: StartSessionRequest):
    """
    Start a new session.
    
    - **playerId**: Player UUID
    
    Returns session ID and status.
    """
    # Verify player exists
    player = db.get_player(request.playerId)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player {playerId} not found"
        )
    
    now = int(datetime.now().timestamp() * 1000)
    session_id = str(uuid.uuid4())
    
    session = Session(
        id=session_id,
        playerId=request.playerId,
        date=datetime.now().strftime("%Y-%m-%d"),
        startTime=now,
        endTime=now,  # Will be updated on end
        shots=[],
        cloudReport=None,
        recordingKey=None,
    )
    
    db.create_session(session)
    
    return {
        "sessionId": session_id,
        "status": "active",
        "startTime": now,
    }


@router.post("/end")
async def end_session(request: EndSessionRequest):
    """
    End an active session.
    
    - **sessionId**: Session UUID
    
    Returns completed session with shots. Cloud report generation is triggered asynchronously.
    """
    session = db.get_session(request.sessionId)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {sessionId} not found"
        )
    
    # Update end time
    end_time = int(datetime.now().timestamp() * 1000)
    db.update_session(request.sessionId, {"endTime": end_time})
    
    # Refresh session
    session = db.get_session(request.sessionId)
    
    return {
        "sessionId": request.sessionId,
        "status": "completed",
        "shots": [shot.model_dump() for shot in session.shots],
        "cloudReportPending": True,
    }


@router.get("", response_model=List[Session])
async def get_sessions(
    playerId: Optional[str] = Query(None, description="Filter by player ID"),
    limit: Optional[int] = Query(10, ge=1, le=100, description="Max results"),
    offset: int = Query(0, ge=0, description="Result offset"),
):
    """
    Get sessions with optional filtering and pagination.
    
    - **playerId**: Optional player ID filter
    - **limit**: Maximum number of results (1-100, default 10)
    - **offset**: Number of results to skip (default 0)
    
    Returns sessions sorted by newest first.
    """
    if playerId:
        sessions = db.get_sessions_by_player(playerId, limit=limit, offset=offset)
    else:
        sessions = db.get_all_sessions(limit=limit, offset=offset)
    
    return sessions


@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """
    Get session by ID.
    
    - **session_id**: Session UUID
    
    Returns complete session with all shots and cloud report (if available).
    """
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str):
    """
    Delete a session.
    
    - **session_id**: Session UUID
    
    **WARNING**: This will permanently delete the session and associated recording.
    """
    success = db.delete_session(session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    # TODO: Also delete recording file if it exists
    
    return None


@router.post("/{session_id}/shots", status_code=status.HTTP_201_CREATED)
async def add_shot(session_id: str, shot: Shot):
    """
    Add a shot to a session.
    
    - **session_id**: Session UUID
    - **shot**: Shot data
    
    This endpoint is called by the backend when a shot is detected.
    Frontend typically doesn't call this directly.
    """
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    # Add shot to session
    session.shots.append(shot)
    db.update_session(session_id, {"shots": [s.model_dump() for s in session.shots]})
    
    return {
        "shotId": shot.id,
        "shotNumber": shot.shotNumber,
        "sessionId": session_id,
    }
