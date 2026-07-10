# voice.py — non-blocking English TTS fallback using pyttsx3
# Runs on laptop (Toolbox A, x64 venv).
# Used when Sarvam Hindi TTS is unavailable / COACHING_LANG == "en".
import pyttsx3
import threading
import queue

_q: queue.Queue = queue.Queue()


def _worker():
    engine = pyttsx3.init()
    engine.setProperty("rate", 175)
    while True:
        text = _q.get()
        try:
            engine.say(text)
            engine.runAndWait()
        except Exception:
            pass   # EDGE: never let TTS crash the app


threading.Thread(target=_worker, daemon=True).start()


def speak(text: str):
    """Queue text for async TTS playback. Drops if already 2+ items queued."""
    if _q.qsize() < 2:   # EDGE: no pile-up — drop if already talking
        _q.put(text)
