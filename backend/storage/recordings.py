# backend/storage/recordings.py - Recording file management

from pathlib import Path
import shutil
import logging
import config

logger = logging.getLogger(__name__)


class RecordingManager:
    """Manages session recording files"""
    
    def __init__(self, storage_dir: Path = config.RECORDINGS_DIR):
        self.storage_dir = storage_dir
    
    def save_recording(self, session_id: str, source_path: Path) -> str:
        """
        Save a recording file.
        
        Args:
            session_id: Session UUID
            source_path: Path to source video file
        
        Returns:
            Recording key (filename)
        """
        filename = f"{session_id}.webm"
        target_path = self.storage_dir / filename
        
        # Copy file
        shutil.copy2(source_path, target_path)
        
        logger.info(f"[Storage] Saved recording: {filename}")
        return filename
    
    def get_recording_path(self, session_id: str) -> Path:
        """Get path to recording file"""
        return self.storage_dir / f"{session_id}.webm"
    
    def delete_recording(self, session_id: str) -> bool:
        """
        Delete a recording file.
        
        Args:
            session_id: Session UUID
        
        Returns:
            True if deleted, False if not found
        """
        file_path = self.get_recording_path(session_id)
        
        if file_path.exists():
            file_path.unlink()
            logger.info(f"[Storage] Deleted recording: {session_id}.webm")
            return True
        
        return False
    
    def get_recording_size(self, session_id: str) -> int:
        """Get recording file size in bytes"""
        file_path = self.get_recording_path(session_id)
        
        if file_path.exists():
            return file_path.stat().st_size
        
        return 0


def init_storage():
    """Initialize storage directories"""
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    config.RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"[Storage] Initialized storage directories")
    logger.info(f"[Storage] Data directory: {config.DATA_DIR}")
    logger.info(f"[Storage] Recordings directory: {config.RECORDINGS_DIR}")
