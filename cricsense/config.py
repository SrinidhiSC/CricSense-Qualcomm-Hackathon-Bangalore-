# config.py — all tunable parameters for CricSense
# Edit these before the demo. Keys marked ❓ must be filled on-site.

# --- Player Setup ---
HANDED = "right"             # "right" or "left" — affects which side of body we track

# --- Arduino Bat Sensor ---
# BAT_MODE: "udp" = wireless (recommended) | "serial" = USB cable fallback
BAT_MODE    = "udp"

# UDP mode (wireless — bat on player, no cable needed)
BAT_UDP_PORT = 9999          # laptop listens on this port for bat data
# bat_wifi_sender.py on the Arduino QRB2210 sends to LAPTOP_IP:BAT_UDP_PORT

# Serial/USB mode (fallback — only if QRB2210 WiFi setup fails)
SERIAL_PORT = "COM5"         # ❓ CONFIRM ON-SITE: check Device Manager for Arduino COM port
SERIAL_BAUD = 500000         # must match bat_sensor.ino Serial.begin()

# --- Network ---
LAPTOP_IP = "192.168.1.42"   # ❓ CONFIRM: run `ipconfig`, use WiFi IPv4 address
WS_PORT   = 8765             # WebSocket port for phone→laptop keypoints
# LLM tool options (Qualcomm officially recommends Llama.cpp — see HowToBuild Part 5):
#   AnythingLLM  → LLM_PORT = 3001  (simple-npu-chatbot, easiest setup)
#   Llama.cpp    → LLM_PORT = 8080  (Qualcomm official recommendation, most NPU-native)
#   LM Studio    → LLM_PORT = 1234  (GUI, easiest fallback)
#   GenieX        → LLM_PORT = 18181 (CLI alternative)
LLM_PORT  = 3001             # change this port to match whichever LLM tool you set up

# --- Cirrascale Cloud AI 100 (register at aisuite.cirrascale.com BEFORE event) ---
CIRRASCALE_URL   = "https://aisuite.cirrascale.com/apis/v2/completions"
CIRRASCALE_KEY   = ""        # ❓ Bearer token from aisuite.cirrascale.com dashboard
CIRRASCALE_MODEL = "Llama-3.1-8B"   # confirmed in docs; ask at event for 70B

# --- AnythingLLM (simple-npu-chatbot) ---
ANYTHINGLLM_API_KEY   = ""           # from AnythingLLM: Settings > Tools > Developer API
ANYTHINGLLM_WORKSPACE = "cricsense"  # workspace slug — create in AnythingLLM UI

# --- Sarvam (API key given at event on Saturday morning) ---
SARVAM_API_KEY     = ""      # ❓ GET FROM SARVAM TEAM ON DAY 1 SATURDAY
SARVAM_ASR_URL     = "https://api.sarvam.ai/speech-to-text"
SARVAM_TTS_URL     = "https://api.sarvam.ai/text-to-speech"
SARVAM_ASR_MODEL   = "saarika:v2"
SARVAM_TTS_MODEL   = "bulbul:v2"     # bulbul:v1 DEPRECATED Apr 2025 — do NOT use v1
SARVAM_TTS_SPEAKER = "anushka"       # bulbul:v2 options: anushka, manisha, vidya, arya,
                                      #                    abhilash, karun, hitesh

# --- Shot Detection ---
IMPACT_G = 8.0               # g-force threshold for impact detection

# --- Coaching ---
COACH_COOLDOWN = 3.0         # seconds between coaching cues (prevents rapid-fire)
LLM_TIMEOUT    = 4.0         # seconds before falling back to rule-based coach

# --- Pose Quality ---
MIN_VISIBILITY = 0.5         # keypoints below this confidence are ignored

# --- Biomechanics Ideal Ranges ---
ELBOW_GOOD = (100, 130)      # front elbow angle (degrees)
KNEE_GOOD  = (140, 160)      # front knee bend (degrees)

# --- Language ---
COACHING_LANG = "hi"         # "hi" = Hindi via Sarvam TTS | "en" = English via pyttsx3

# --- Auto-compute landmark indices based on handedness ---
if HANDED == "right":
    FRONT = {
        "shoulder": 11, "elbow": 13, "wrist": 15,
        "hip": 23, "knee": 25, "ankle": 27
    }
else:
    FRONT = {
        "shoulder": 12, "elbow": 14, "wrist": 16,
        "hip": 24, "knee": 26, "ankle": 28
    }
