# backend/bridge/backend_bridge.py - Bridge to existing cricsense backend

"""
This module bridges the new backend/ API layer with the existing cricsense/ backend.

Architecture:
- The existing cricsense/ backend handles:
  * Phone data reception (port 8765)
  * Arduino Nano integration (IMU data)
  * NPU pose estimation (MediaPipe + QNN)
  * Shot detection logic
  * Sarvam AI integration (Hindi Q&A)
  * Cloud report generation (Cirrascale)

- This bridge connects the two layers:
  * Reads processed data from cricsense backend
  * Provides data to WebSocket server for frontend
  * Forwards API requests to cricsense modules
  * Manages session lifecycle

Data Flow:
1. cricsense backend processes raw data → shared queue/memory
2. Bridge reads from shared queue → builds frame data
3. WebSocket server broadcasts → frontend @ 30 FPS
"""

import sys
import os
from pathlib import Path
from typing import Optional, Dict
import queue
import threading
import logging

from models import (
    Landmark,
    BatData,
    Metrics,
    DeviceStatus,
    CloudReport,
    Shot,
    CoachingCue,
)

logger = logging.getLogger(__name__)

# Add cricsense directory to Python path
CRICSENSE_DIR = Path(__file__).parent.parent.parent / "cricsense"
sys.path.insert(0, str(CRICSENSE_DIR))


# Shared data structures for communication
_frame_queue = queue.Queue(maxsize=10)  # Latest frame data
_device_status = DeviceStatus(arduino=False, phone=False, npu=False, cloud=False)
_active_session_id: Optional[str] = None
_lock = threading.Lock()


def get_latest_frame_data() -> Optional[Dict]:
    """
    Get the latest frame data from cricsense backend.
    
    Returns:
    - keypoints: List of Landmark objects (33 pose keypoints)
    - metrics: Metrics object (elbow, knee, head angles)
    - bat: BatData object (swing speed, wrist angles, impact)
    - devices: DeviceStatus object (connection states)
    """
    try:
        # Non-blocking queue read
        frame_data = _frame_queue.get_nowait()
        return frame_data
    except queue.Empty:
        return None


def get_device_status() -> DeviceStatus:
    """Get current device connection status"""
    with _lock:
        return _device_status


def get_active_session() -> Optional[str]:
    """Get active session ID if any"""
    with _lock:
        return _active_session_id


async def generate_cloud_report(shots: list[Shot]) -> CloudReport:
    """
    Generate cloud report from session shots.
    Calls the existing session_report.py module.
    
    Args:
        shots: List of Shot objects from session
    
    Returns:
        CloudReport with 4-section analysis
    """
    try:
        # Import session report generator
        from session_report import generate_report
        
        # Convert shots to format expected by session_report
        shot_data = [
            {
                "shotNumber": shot.shotNumber,
                "timestamp": shot.timestamp,
                "elbow": shot.elbow,
                "knee": shot.knee,
                "head": shot.head,
                "swingSpeed": shot.swingSpeed,
                "wristSnap": shot.wristSnap,
            }
            for shot in shots
        ]
        
        # Generate report
        report_dict = await generate_report(shot_data)
        
        # Convert to CloudReport model
        report = CloudReport(
            section1=report_dict["section1"],
            section2=report_dict["section2"],
            section3=report_dict["section3"],
            section4=report_dict["section4"],
        )
        
        return report
    
    except Exception as e:
        logger.error(f"[Bridge] Failed to generate cloud report: {e}")
        # Return empty report on error
        return CloudReport(
            section1="Report generation failed.",
            section2="",
            section3="",
            section4="",
        )


async def process_hindi_question(question: str, context: Dict) -> str:
    """
    Process Hindi question and get coaching reply.
    Uses Sarvam AI integration from cricsense backend.
    
    Args:
        question: Hindi question text
        context: Current metrics and bat data
    
    Returns:
        Hindi coaching reply
    """
    try:
        # Import Sarvam coach
        from sarvam.coach import get_coaching_reply
        
        reply = await get_coaching_reply(question, context)
        return reply
    
    except Exception as e:
        logger.error(f"[Bridge] Failed to process Hindi question: {e}")
        return "क्षमा करें, मैं इस सवाल का जवाब नहीं दे सकता।"  # "Sorry, I cannot answer this question."


async def transcribe_hindi_audio(audio_path: str) -> str:
    """
    Transcribe Hindi audio to text.
    Uses Sarvam ASR from cricsense backend.
    
    Args:
        audio_path: Path to audio file
    
    Returns:
        Hindi transcript
    """
    try:
        # Import Sarvam ASR
        from sarvam.asr import transcribe_audio
        
        transcript = await transcribe_audio(audio_path)
        return transcript
    
    except Exception as e:
        logger.error(f"[Bridge] Failed to transcribe audio: {e}")
        return ""


def update_device_status(arduino: bool, phone: bool, npu: bool, cloud: bool):
    """Update device connection status (called by cricsense backend)"""
    global _device_status
    with _lock:
        _device_status = DeviceStatus(
            arduino=arduino,
            phone=phone,
            npu=npu,
            cloud=cloud,
        )


def publish_frame_data(
    keypoints: Optional[list[Landmark]],
    metrics: Metrics,
    bat: BatData,
):
    """
    Publish frame data to the bridge (called by cricsense backend).
    
    This is called at ~30 FPS by the cricsense backend after processing.
    """
    frame_data = {
        "keypoints": keypoints,
        "metrics": metrics,
        "bat": bat,
        "devices": get_device_status(),
    }
    
    try:
        # Put in queue (non-blocking, drop oldest if full)
        _frame_queue.put_nowait(frame_data)
    except queue.Full:
        # Drop oldest frame and add new one
        try:
            _frame_queue.get_nowait()
            _frame_queue.put_nowait(frame_data)
        except queue.Empty:
            pass


def set_active_session(session_id: Optional[str]):
    """Set active session ID (called when session starts/ends)"""
    global _active_session_id
    with _lock:
        _active_session_id = session_id


# Initialize bridge
logger.info("[Bridge] Backend bridge initialized")
logger.info(f"[Bridge] Connected to cricsense backend at: {CRICSENSE_DIR}")
