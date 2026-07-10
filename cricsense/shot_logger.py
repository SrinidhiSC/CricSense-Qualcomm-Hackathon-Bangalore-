# shot_logger.py — per-shot data storage for the session
import time

session_shots = []


def log_shot(metrics, bat_data, coaching_cue):
    """Append one shot's data to session_shots."""
    session_shots.append({
        "timestamp":     time.time(),
        "elbow_angle":   metrics["elbow"],
        "knee_angle":    metrics["knee"],
        "head":          metrics["head"],
        "swing_speed_g": bat_data.get("swing", 0),
        "wrist_snap":    bat_data.get("wrist", 0),
        "coaching_cue":  coaching_cue,
    })


def clear_session():
    """Reset for a new session."""
    session_shots.clear()
