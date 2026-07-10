# sarvam/asr_ondevice.py — Hindi speech-to-text via Sarvam on-device SDK
# ONLY USE IF the Sarvam team at the event provides an on-device SDK.
# Falls back gracefully if SDK is not installed.
import sounddevice as sd


_USE_SARVAM_EDGE = False
_asr = None

try:
    from sarvam_edge import SarvamASR        # try this import name first
    _asr = SarvamASR(language="hi-IN")
    _USE_SARVAM_EDGE = True
except ImportError:
    try:
        from sarvam import ASR as SarvamASR  # alternate SDK name
        _asr = SarvamASR(language="hi-IN")
        _USE_SARVAM_EDGE = True
    except ImportError:
        print("[sarvam/asr_ondevice] SDK not found — cloud fallback will be used")


def transcribe_hindi_ondevice(audio_bytes: bytes = None):
    """
    Convert Hindi speech to text using on-device Sarvam model.
    74M parameter model, ~294 MB, <300 ms latency on Snapdragon 8 Elite.

    Returns: transcript string, or None if SDK unavailable (caller uses cloud).
    """
    if not _USE_SARVAM_EDGE or _asr is None:
        return None   # signal caller to use cloud fallback

    if audio_bytes is None:
        audio = sd.rec(int(3 * 16000), samplerate=16000, channels=1, dtype="int16")
        sd.wait()
        audio_bytes = audio.tobytes()

    return _asr.transcribe(audio_bytes)
