# sarvam/smart.py — unified Sarvam interface with automatic fallback chain
# Import this everywhere instead of calling approach A or B directly.
#
# Priority:
#   1. On-device SDK (if Sarvam team provides it at the event)
#   2. Cloud API     (confirmed — credits given Saturday morning)
#   3. Print + no-op (never crashes the app)

from .asr_ondevice import transcribe_hindi_ondevice, _USE_SARVAM_EDGE
from .tts_ondevice import speak_hindi_ondevice, _USE_SARVAM_TTS
from .asr_cloud import transcribe_hindi_cloud
from .tts_cloud import speak_hindi_cloud

if _USE_SARVAM_EDGE:
    print("[sarvam/smart] On-device ASR active")
else:
    print("[sarvam/smart] Cloud ASR active")

if _USE_SARVAM_TTS:
    print("[sarvam/smart] On-device TTS active")
else:
    print("[sarvam/smart] Cloud TTS active")


def transcribe(audio_bytes: bytes = None) -> str:
    """
    Transcribe Hindi audio. Tries on-device first, then cloud.
    Returns transcript string (empty string on total failure).
    """
    if _USE_SARVAM_EDGE:
        result = transcribe_hindi_ondevice(audio_bytes)
        if result:
            return result
    return transcribe_hindi_cloud(audio_bytes)


def speak(text: str) -> None:
    """
    Speak Hindi text. Tries on-device first, then cloud, then prints.
    Never raises.
    """
    if _USE_SARVAM_TTS and speak_hindi_ondevice(text):
        return
    if speak_hindi_cloud(text):
        return
    # Final fallback — English laptop TTS (voice.py) will handle it upstream
    print(f"[sarvam/smart TTS fallback]: {text}")
