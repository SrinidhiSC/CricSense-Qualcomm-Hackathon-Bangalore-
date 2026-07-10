# main.py — CricSense main loop
# Runs on Surface Laptop 7 (Toolbox A — x64 venv, AMD64 Python 3.10).
#
# Prerequisites:
#   • AnythingLLM / simple-npu-chatbot running  → http://127.0.0.1:3001
#   • Arduino UNO Q flashed with bat_sensor.ino, USB connected
#   • OnePlus 15 running phone_pose (Android app) on same WiFi, OR laptop webcam as fallback
#
# Controls during demo:
#   Q  — quit
#   S  — end session → trigger Cirrascale Cloud AI 100 report

import time
import threading
import cv2

from config import FRONT, COACH_COOLDOWN, MIN_VISIBILITY, COACHING_LANG
from angles import angle
from bat_reader import bat_data, bat_is_alive
from coaching import get_coaching
from voice import speak as speak_en
from ui import update_ui
from ws_receiver import keypoints_buffer, set_latest, start_ws
from shot_logger import log_shot

# -- Optional Sarvam Hindi TTS (used when COACHING_LANG == "hi") --------
if COACHING_LANG == "hi":
    try:
        from sarvam import speak as speak_hi
        _hindi_ok = True
    except Exception:
        _hindi_ok = False
        print("[main] Sarvam import failed — using English TTS fallback")
else:
    _hindi_ok = False


def _speak(text: str):
    """Speak coaching cue in the configured language with English fallback."""
    if _hindi_ok:
        from sarvam import speak as speak_hi
        speak_hi(text)
    else:
        speak_en(text)


# --------------------------------------------------------------------------
# Adapter so WebSocket dict keypoints look like MediaPipe landmark objects
# for ui.py which expects .x, .y, .visibility attributes
# --------------------------------------------------------------------------
class _LMAdapter:
    __slots__ = ("x", "y", "visibility")

    def __init__(self, d: dict):
        self.x          = d["x"]
        self.y          = d["y"]
        self.visibility = d.get("visibility", 1.0)


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def _landmarks_ok(lm: list) -> bool:
    """Return True only when all key joints are visible and confident."""
    if lm is None:
        return False
    need = [FRONT["shoulder"], FRONT["elbow"], FRONT["wrist"], FRONT["knee"], FRONT["ankle"]]
    if len(lm) <= max(need):
        return False
    return all(lm[i].get("visibility", 1.0) >= MIN_VISIBILITY for i in need)


def _calculate_metrics(lm: list) -> dict:
    """Compute elbow angle, knee angle, and head position from keypoints."""
    p = lambda i: (lm[i]["x"], lm[i]["y"])
    nose_x = lm[0]["x"] if lm else 0.5
    knee_x = lm[FRONT["knee"]]["x"]
    head   = "over front knee" if abs(nose_x - knee_x) < 0.08 else "falling away"
    return {
        "elbow": angle(p(FRONT["shoulder"]), p(FRONT["elbow"]), p(FRONT["wrist"])),
        "knee":  angle(p(FRONT["hip"]),      p(FRONT["knee"]),  p(FRONT["ankle"])),
        "head":  head,
    }


# --------------------------------------------------------------------------
# Main loop
# --------------------------------------------------------------------------

# Start WebSocket server for phone keypoints in a background thread
threading.Thread(target=start_ws, daemon=True).start()

# Use laptop webcam as fallback if phone pose stream not yet connected
cap = cv2.VideoCapture(0)

last_coach_time = 0.0
feedback        = "Get into your stance..."
metrics         = {"elbow": 0.0, "knee": 0.0, "head": "-"}

print("CricSense running.  Q = quit  |  S = session report")

while True:
    ok, frame = cap.read()
    if not ok:
        time.sleep(0.05)
        continue   # EDGE: no frame → wait, don't busy-spin

    # Snapshot the keypoints buffer (thread-safe copy)
    raw_lm = list(keypoints_buffer) if keypoints_buffer else None

    lm_objects = [_LMAdapter(k) for k in raw_lm] if raw_lm else []

    if _landmarks_ok(raw_lm):
        metrics = _calculate_metrics(raw_lm)

        # Keep ws_receiver in sync so it can answer Hindi questions from the phone
        set_latest(metrics, bat_data)

        shot_triggered = (
            bat_data["impact"] == 1
            and bat_is_alive()
            and (time.time() - last_coach_time) > COACH_COOLDOWN
        )

        if shot_triggered:
            feedback = get_coaching(metrics, bat_data)
            _speak(feedback)
            log_shot(metrics, bat_data, feedback)
            last_coach_time = time.time()

    update_ui(frame, lm_objects, metrics, feedback, bat_is_alive())

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        print("Exiting CricSense.")
        break
    if key == ord("s"):
        from session_report import show_report
        show_report()

cap.release()
cv2.destroyAllWindows()
