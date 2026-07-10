# ui.py — skeleton overlay + metrics/status bar rendered via OpenCV
# Runs on laptop (Toolbox A, x64 venv).
import cv2
import time
from config import ELBOW_GOOD, MIN_VISIBILITY

# MediaPipe Pose connections (subset — arms, torso, legs)
CONNECTIONS = [
    (11, 13), (13, 15), (12, 14), (14, 16),   # arms
    (11, 12), (23, 24),                         # shoulders, hips
    (11, 23), (12, 24),                         # torso sides
    (23, 25), (25, 27), (24, 26), (26, 28),    # legs
]

_last_time = time.time()


def _is_visible(lm, i):
    """Return True if landmark i has visibility >= MIN_VISIBILITY."""
    # EDGE: treat missing visibility attribute as 1.0 to avoid AttributeError
    v = lm[i].visibility if hasattr(lm[i], "visibility") else 1.0
    return v >= MIN_VISIBILITY


def update_ui(frame, lm, metrics, feedback, bat_alive=True):
    """
    Draw skeleton, metrics bar and feedback text onto `frame` in-place.

    frame     : OpenCV BGR image (from cap.read())
    lm        : list of landmark objects with .x, .y, .visibility (normalised [0,1])
    metrics   : dict with keys 'elbow', 'knee', 'head'
    feedback  : coaching cue string to display at bottom
    bat_alive : bool — whether the Arduino serial link is active
    """
    global _last_time
    h, w = frame.shape[:2]

    # Green skeleton = good elbow; red = needs fixing
    good  = ELBOW_GOOD[0] <= metrics["elbow"] <= ELBOW_GOOD[1]
    color = (0, 255, 0) if good else (0, 0, 255)

    if lm:
        for a, b in CONNECTIONS:
            if a < len(lm) and b < len(lm) and _is_visible(lm, a) and _is_visible(lm, b):
                pa = (int(lm[a].x * w), int(lm[a].y * h))
                pb = (int(lm[b].x * w), int(lm[b].y * h))
                cv2.line(frame, pa, pb, color, 3)

    # --- Bottom feedback bar ---
    cv2.rectangle(frame, (0, h - 60), (w, h), (0, 0, 0), -1)
    cv2.putText(
        frame, feedback[:60],
        (10, h - 20),
        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2,
    )

    # --- Top status bar ---
    fps = 1.0 / max(1e-3, time.time() - _last_time)
    _last_time = time.time()
    bat_txt = "Bat:OK" if bat_alive else "Bat:--"   # EDGE: always show sensor status
    bar = (
        f"Elbow {metrics['elbow']:.0f}  "
        f"Knee {metrics['knee']:.0f}  "
        f"{fps:4.1f}FPS  NPU:ON  {bat_txt}"
    )
    cv2.putText(frame, bar, (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

    cv2.imshow("CricSense", frame)
