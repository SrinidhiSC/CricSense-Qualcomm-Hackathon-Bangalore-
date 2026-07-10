# backend/api/recordings.py - Recording upload/download endpoints

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
import aiofiles
import config

router = APIRouter(prefix="/api/recordings", tags=["Recordings"])


@router.post("/{session_id}", status_code=status.HTTP_201_CREATED)
async def upload_recording(session_id: str, file: UploadFile = File(...)):
    """
    Upload session recording video.
    
    - **session_id**: Session UUID
    - **file**: Video file (video/webm format)
    
    Returns recording metadata.
    """
    # Validate file type
    if file.content_type not in ["video/webm", "video/mp4"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be video/webm or video/mp4"
        )
    
    # Generate filename
    filename = f"{session_id}.webm"
    file_path = config.RECORDINGS_DIR / filename
    
    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    # Update session with recording key
    import database as db
    session = db.get_session(session_id)
    if session:
        db.update_session(session_id, {"recordingKey": filename})
    
    return {
        "sessionId": session_id,
        "recordingKey": filename,
        "size": len(content),
        "contentType": file.content_type,
    }


@router.get("/{session_id}")
async def download_recording(session_id: str):
    """
    Download session recording video.
    
    - **session_id**: Session UUID
    
    Returns video file as binary stream.
    """
    filename = f"{session_id}.webm"
    file_path = config.RECORDINGS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recording for session {session_id} not found"
        )
    
    return FileResponse(
        path=file_path,
        media_type="video/webm",
        filename=filename,
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recording(session_id: str):
    """
    Delete session recording.
    
    - **session_id**: Session UUID
    
    **WARNING**: This permanently deletes the recording file.
    """
    filename = f"{session_id}.webm"
    file_path = config.RECORDINGS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recording for session {session_id} not found"
        )
    
    # Delete file
    file_path.unlink()
    
    # Update session to remove recording key
    import database as db
    session = db.get_session(session_id)
    if session:
        db.update_session(session_id, {"recordingKey": None})
    
    return None
