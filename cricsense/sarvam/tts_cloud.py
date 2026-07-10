# sarvam/tts_cloud.py — Hindi text-to-speech via Sarvam Cloud API
# Runs on OnePlus 15 (Termux) OR on laptop.
import base64
import io
import requests
import sounddevice as sd
import soundfile as sf

try:
    from config import SARVAM_API_KEY, SARVAM_TTS_URL, SARVAM_TTS_MODEL, SARVAM_TTS_SPEAKER
except ImportError:
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from config import SARVAM_API_KEY, SARVAM_TTS_URL, SARVAM_TTS_MODEL, SARVAM_TTS_SPEAKER


def speak_hindi_cloud(text: str) -> bool:
    """
    Convert Hindi text to speech via Sarvam Cloud API and play it.

    Uses bulbul:v2 (v1 DEPRECATED April 30 2025 — will fail if used).
    bulbul:v2 voices: anushka, manisha, vidya, arya, abhilash, karun, hitesh

    Returns True if audio played successfully, False on any failure.
    Caller should use English pyttsx3 fallback when this returns False.
    """
    try:
        r = requests.post(
            SARVAM_TTS_URL,
            headers={
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "inputs": [text],
                "target_language_code": "hi-IN",
                "speaker": SARVAM_TTS_SPEAKER,   # e.g. "anushka"
                "model": SARVAM_TTS_MODEL,        # e.g. "bulbul:v2"
                "pitch": 0,
                "pace": 1.0,
                "loudness": 1.5,
                "speech_sample_rate": 22050,
            },
            timeout=10,
        )
        if r.status_code == 200:
            audio_b64  = r.json()["audios"][0]
            audio_bytes = base64.b64decode(audio_b64)
            audio_data, samplerate = sf.read(io.BytesIO(audio_bytes))
            sd.play(audio_data, samplerate)
            sd.wait()
            return True
    except Exception:
        pass
    return False
