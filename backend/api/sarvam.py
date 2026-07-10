# backend/api/sarvam.py - Hindi Q&A and transcription endpoints

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import tempfile
import os

router = APIRouter(prefix="/api/sarvam", tags=["Sarvam AI"])


class QuestionRequest(BaseModel):
    question: str
    context: Optional[dict] = None


@router.post("/question")
async def ask_question(request: QuestionRequest):
    """
    Send a Hindi question and get a coaching reply.
    
    - **question**: Hindi question text (e.g., "meri batting kaise thi?")
    - **context**: Optional context with current metrics and bat data
    
    Returns Hindi coaching reply from LLM.
    """
    try:
        # Import Sarvam integration from cricsense backend
        # This connects to the existing sarvam/ module
        from bridge.backend_bridge import process_hindi_question
        
        reply = await process_hindi_question(
            question=request.question,
            context=request.context or {}
        )
        
        return {
            "reply": reply,
            "timestamp": int(__import__("datetime").datetime.now().timestamp() * 1000),
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process question: {str(e)}"
        )


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe Hindi audio to text using Sarvam ASR.
    
    - **audio**: Audio file (audio/wav format)
    
    Returns Hindi transcript.
    """
    # Validate file type
    if not audio.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file"
        )
    
    try:
        # Save audio to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Import Sarvam ASR from cricsense backend
            from bridge.backend_bridge import transcribe_hindi_audio
            
            transcript = await transcribe_hindi_audio(tmp_path)
            
            return {
                "transcript": transcript,
                "language": "hi",
                "confidence": 0.95,  # Placeholder - actual confidence from Sarvam
            }
        
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio: {str(e)}"
        )
