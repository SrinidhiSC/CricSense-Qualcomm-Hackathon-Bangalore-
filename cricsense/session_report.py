# session_report.py — end-of-session deep biomechanics report via Cirrascale Cloud AI 100
# Press 'S' during the demo to trigger. Runs on laptop (Toolbox A, x64 venv).
import requests
from config import CIRRASCALE_URL, CIRRASCALE_KEY, CIRRASCALE_MODEL
from shot_logger import session_shots


def generate_session_report(shots_data: list) -> str:
    """
    Send all session shots to Cirrascale for deep biomechanics analysis.
    Returns the report string (or an error message — never raises).

    IMPORTANT: Cirrascale response is choices[0]["text"]  (NOT .message.content)
    """
    if not shots_data:
        return "[No shots recorded this session]"

    shots_summary = "\n".join(
        f"Shot {i + 1}: Elbow={s['elbow_angle']:.0f}°  Knee={s['knee_angle']:.0f}°  "
        f"Swing={s['swing_speed_g']:.1f}g  Head={s['head']}  Cue='{s['coaching_cue']}'"
        for i, s in enumerate(shots_data)
    )

    prompt = (
        "You are an expert cricket biomechanics analyst.\n"
        "A player just completed a batting session. Here are all their shots:\n\n"
        f"{shots_summary}\n\n"
        "Please provide:\n"
        "1. The most common technical flaw across all shots\n"
        "2. What improved during the session (compare early vs late shots)\n"
        "3. One specific drill to work on before next session\n"
        "4. Overall session rating out of 10\n"
        "Keep the report under 100 words."
    )

    try:
        r = requests.post(
            CIRRASCALE_URL,
            headers={
                "Authorization": f"Bearer {CIRRASCALE_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "prompt": prompt,
                "model": CIRRASCALE_MODEL,
                "max_tokens": 150,
                "stream": False,
            },
            timeout=60,
        )
        if r.status_code == 200:
            return r.json()["choices"][0]["text"]   # NOTE: .text not .message.content
        return f"[Cloud report unavailable: HTTP {r.status_code}]"
    except Exception as e:
        return f"[Cloud report error: {e}]"


def show_report() -> str:
    """
    Print and return the session report. Call on 'S' key press during demo.
    """
    if not session_shots:
        print("No shots recorded yet.")
        return ""
    print(f"\n=== SESSION REPORT ({len(session_shots)} shots) ===")
    report = generate_session_report(session_shots)
    print(report)
    print("=" * 40)
    return report
