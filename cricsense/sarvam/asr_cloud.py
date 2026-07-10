# sarvam/asr_cloud.py — Hindi speech-to-text via Sarvam Cloud API
# Runs on OnePlus 15 (Termux) OR on laptop as fallback.
import io
import wave
import requests
import sounddevice as sd
import numpy as np

# Import config relative to project root — adjust sys.path if running standalone
try:
    from config import SARVAM_API_KEY, SARVAM_ASR_URL, SARVAM_ASR_MODEL
except ImportError:
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from config import SARVAM_API_KEY, SARVAM_ASR_URL, SARVAM_ASR_MODEL


def record_audio(seconds: float = 3, samplerate: int = 16000):
    """Record audio from microphone. Returns (numpy array, samplerate)."""
    audio = sd.rec(
        int(seconds * samplerate),
        samplerate=samplerate,
        channels=1,
        dtype="int16",
    )
    sd.wait()
    return audio, samplerate


def audio_to_wav_bytes(audio, samplerate: int) -> bytes:
    """Convert numpy int16 audio array to WAV bytes for API upload."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)   # int16 = 2 bytes
        wf.setframerate(samplerate)
        wf.writeframes(audio.tobytes())
    return buf.getvalue()


def transcribe_hindi_cloud(audio_bytes: bytes = None) -> str:
    """
    Convert Hindi speech to text via Sarvam Cloud API.
    If audio_bytes is None, records 3 seconds from microphone first.
    Returns: Hindi transcript string, or "" on failure.

    Auth failure = HTTP 403 (NOT 401).
    Rate limit    = HTTP 429 → caller should retry with backoff.
    """
    if audio_bytes is None:
        audio, sr = record_audio(seconds=3)
        audio_bytes = audio_to_wav_bytes(audio, sr)

    try:
        r = requests.post(
            SARVAM_ASR_URL,
            headers={"api-subscription-key": SARVAM_API_KEY},
            files={"file": ("audio.wav", audio_bytes, "audio/wav")},
            data={
                "language_code": "hi-IN",
                "model": SARVAM_ASR_MODEL,   # e.g. "saarika:v2"
                "with_timestamps": "false",
            },
            timeout=10,
        )
        if r.status_code == 200:
            return r.json().get("transcript", "")
    except Exception:
        pass
    return ""   # empty string signals caller to use rule-based coach
