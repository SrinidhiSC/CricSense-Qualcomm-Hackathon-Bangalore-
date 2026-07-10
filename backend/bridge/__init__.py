# backend/bridge/__init__.py

from .backend_bridge import (
    get_latest_frame_data,
    get_device_status,
    get_active_session,
    generate_cloud_report,
    process_hindi_question,
    transcribe_hindi_audio,
)

__all__ = [
    "get_latest_frame_data",
    "get_device_status",
    "get_active_session",
    "generate_cloud_report",
    "process_hindi_question",
    "transcribe_hindi_audio",
]
