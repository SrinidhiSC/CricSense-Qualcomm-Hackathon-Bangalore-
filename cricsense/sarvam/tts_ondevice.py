# sarvam/tts_ondevice.py — Hindi text-to-speech via Sarvam on-device SDK
# ONLY USE IF the Sarvam team at the event provides an on-device SDK.
# Falls back gracefully if SDK is not installed.
import io
import sounddevice as sd


_USE_SARVAM_TTS = False
_tts = None

try:
    from sarvam_edge import SarvamTTS         # try this import name first
    _tts = SarvamTTS(language="hi-IN", voice="male_1")
    _USE_SARVAM_TTS = True
except ImportError:
    try:
        from sarvam import TTS as SarvamTTS   # alternate SDK name
        _tts = SarvamTTS(language="hi-IN", voice="male_1")
        _USE_SARVAM_TTS = True
    except ImportError:
        print("[sarvam/tts_ondevice] SDK not found — cloud fallback will be used")


def speak_hindi_ondevice(text: str) -> bool:
    """
    Speak Hindi text using on-device Sarvam TTS model.
    24M params, ~60 MB, ~260 ms latency on Snapdragon 8 Elite.

    Returns True if played, False if SDK unavailable.
    """
    if not _USE_SARVAM_TTS or _tts is None:
        return False

    try:
        import soundfile as sf
        audio_bytes = _tts.synthesize(text)
        data, sr = sf.read(io.BytesIO(audio_bytes))
        sd.play(data, sr)
        sd.wait()
        return True
    except Exception:
        return False
