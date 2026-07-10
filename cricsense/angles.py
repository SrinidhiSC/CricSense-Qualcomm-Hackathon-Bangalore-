# angles.py — joint angle computation
import math


def angle(a, b, c):
    """
    Compute the angle at vertex b formed by rays b→a and b→c.

    a, b, c: (x, y) tuples in normalised [0,1] space (MediaPipe landmark coords)
    Returns: angle in degrees (0 to 180)
    """
    ax = a[0] - b[0]
    ay = a[1] - b[1]
    cx = c[0] - b[0]
    cy = c[1] - b[1]

    dot   = ax * cx + ay * cy
    mag_a = math.hypot(ax, ay)
    mag_c = math.hypot(cx, cy)

    if mag_a < 1e-9 or mag_c < 1e-9:
        return 0.0   # degenerate: coincident points → return 0

    cosine = max(-1.0, min(1.0, dot / (mag_a * mag_c)))
    return math.degrees(math.acos(cosine))
