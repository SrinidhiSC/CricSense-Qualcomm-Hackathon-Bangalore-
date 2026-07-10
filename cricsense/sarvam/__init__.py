# sarvam/__init__.py
# Re-export the unified smart interface so callers can do:
#   from sarvam import transcribe, speak
from .smart import transcribe, speak

__all__ = ["transcribe", "speak"]
