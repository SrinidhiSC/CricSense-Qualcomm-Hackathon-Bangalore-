# coaching.py — LLM coaching brain + instant rule-based fallback
# Connects to AnythingLLM (simple-npu-chatbot) via OpenAI-compatible API.
# Falls back to rule-based coach instantly if LLM is slow/unavailable.
from openai import OpenAI
from config import (
    LLM_TIMEOUT, ELBOW_GOOD, KNEE_GOOD,
    LLM_PORT, COACHING_LANG,
    ANYTHINGLLM_API_KEY, ANYTHINGLLM_WORKSPACE,
)

# Auto-detect correct API path based on port:
#   Port 8080  → Llama.cpp        → /v1              (Qualcomm official recommendation)
#   Port 3001  → AnythingLLM      → /api/v1/openai   (simple-npu-chatbot)
#   Port 1234  → LM Studio        → /v1
#   Port 18181 → GenieX            → /v1
if LLM_PORT == 3001:
    _base_url = f"http://127.0.0.1:{LLM_PORT}/api/v1/openai"
else:
    _base_url = f"http://127.0.0.1:{LLM_PORT}/v1"
client = OpenAI(
    base_url=_base_url,
    api_key=ANYTHINGLLM_API_KEY or "no-key",  # Llama.cpp needs no real key
    timeout=LLM_TIMEOUT,   # EDGE: hard timeout — demo never hangs waiting for LLM
)


def _rule_based(metrics, bat):
    """Instant backup cue (<1 ms) — demo NEVER goes silent."""
    if metrics["elbow"] < ELBOW_GOOD[0]:
        return "Lift your front elbow — it's too low."
    if metrics["elbow"] > ELBOW_GOOD[1]:
        return "Relax your front arm — too straight."
    if metrics["knee"] > KNEE_GOOD[1]:
        return "Bend your front knee more."
    if metrics["knee"] < KNEE_GOOD[0]:
        return "Don't collapse — keep your knee stable."
    if metrics["head"] == "falling away":
        return "Keep your head still over the ball."
    if bat.get("wrist", 0) > 150:
        return "Your wrists turned too early — wait for it."
    return "Good shot — solid technique."


def build_prompt(metrics, bat, lang="en"):
    """Build a prompt for the LLM in Hindi or English."""
    if lang == "hi":
        return (
            f"Aap ek expert cricket batting coach hain jo sirf Hindi mein coaching dete hain.\n"
            f"Front elbow: {metrics['elbow']:.0f} degree (theek: {ELBOW_GOOD[0]}-{ELBOW_GOOD[1]}).\n"
            f"Front knee: {metrics['knee']:.0f} degree (theek: {KNEE_GOOD[0]}-{KNEE_GOOD[1]}).\n"
            f"Head: {metrics['head']}. Swing speed: {bat.get('swing', 0):.1f}g. "
            f"Wrist snap: {'BAHUT JALDI' if bat.get('wrist', 0) > 150 else 'theek hai'}.\n"
            f"Ek chhota, encouraging coaching cue do, max 15 words, SIRF HINDI MEIN."
        )
    return (
        f"You are an expert cricket batting coach giving instant feedback.\n"
        f"Front elbow: {metrics['elbow']:.0f} deg (ideal {ELBOW_GOOD[0]}-{ELBOW_GOOD[1]}).\n"
        f"Front knee: {metrics['knee']:.0f} deg (ideal {KNEE_GOOD[0]}-{KNEE_GOOD[1]}).\n"
        f"Head: {metrics['head']}. Swing speed: {bat.get('swing', 0):.1f}g. "
        f"Wrist snap: {'TOO EARLY' if bat.get('wrist', 0) > 150 else 'good'}.\n"
        f"Give ONE short encouraging cue, max 15 words."
    )


def build_prompt_hindi(metrics, bat, player_question=None):
    """Hindi prompt — used when player asks a question via Sarvam ASR."""
    base = (
        f"Aap ek expert cricket batting coach hain jo sirf Hindi mein chhota feedback dete hain.\n"
        f"Front elbow: {metrics['elbow']:.0f} degree (theek hai: {ELBOW_GOOD[0]}-{ELBOW_GOOD[1]}).\n"
        f"Front knee: {metrics['knee']:.0f} degree (theek hai: {KNEE_GOOD[0]}-{KNEE_GOOD[1]}).\n"
        f"Swing speed: {bat.get('swing', 0):.1f}g.\n"
    )
    if player_question:
        return (
            base
            + f"Player ne poocha: '{player_question}'\n"
            + "Ek chhota, encouraging coaching cue do, max 15 words, sirf Hindi mein."
        )
    return base + "Ek chhota, encouraging coaching cue do, max 15 words, sirf Hindi mein."


def get_coaching(metrics, bat):
    """
    Returns a coaching cue string.
    Tries LLM first (within LLM_TIMEOUT); falls back to rule-based instantly.
    EDGE: never raises — always returns a string.
    """
    try:
        r = client.chat.completions.create(
            # EDGE: model field = workspace slug (NOT "Llama 3.1 8B Chat 8K")
            model=ANYTHINGLLM_WORKSPACE,
            messages=[{"role": "user", "content": build_prompt(metrics, bat, COACHING_LANG)}],
            max_tokens=40,
        )
        text = (r.choices[0].message.content or "").strip()
        if not text or len(text) > 120:   # EDGE: empty/rambling → use backup
            return _rule_based(metrics, bat)
        return text
    except Exception:
        return _rule_based(metrics, bat)  # EDGE: timeout/crash → instant backup cue
