# bat_reader.py — reads bat sensor JSON from Arduino UNO Q
#
# TWO MODES (set BAT_MODE in config.py):
#   "udp"    — Arduino sends WiFi UDP packets → laptop receives wirelessly (RECOMMENDED)
#              No USB cable. Arduino + power bank strapped to bat. Full freedom of movement.
#   "serial" — Arduino sends over USB cable → fallback if WiFi setup fails
#
# Both modes update the same `bat_data` dict and `bat_is_alive()` flag.
# The rest of the codebase (main.py, coaching.py) never needs to know which mode.

import json
import threading
import time
import socket

from config import BAT_MODE, BAT_UDP_PORT, SERIAL_PORT, SERIAL_BAUD

bat_data = {"swing": 0.0, "wrist": 0.0, "wristRate": 0.0, "impact": 0}
_alive   = False


# ─────────────────────────────────────────────
# MODE A: UDP (wireless — bat on player, no cable)
# ─────────────────────────────────────────────

def _udp_reader():
    """
    Listen for UDP packets from bat_wifi_sender.py running on Arduino QRB2210.
    Each packet is one JSON line:  {"swing":3.2,"wrist":87.3,"wristRate":412.1,"impact":0}
    """
    global _alive
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("0.0.0.0", BAT_UDP_PORT))
    sock.settimeout(2.0)   # 2s timeout → _alive goes False if bat stops sending
    print(f"[bat_reader] UDP mode — listening on port {BAT_UDP_PORT}")

    while True:
        try:
            data, _ = sock.recvfrom(256)   # max JSON packet size is tiny
            line = data.decode("utf-8", errors="ignore").strip()
            if line.startswith("{"):
                d = json.loads(line)
                bat_data.update(d)
                _alive = True
        except socket.timeout:
            _alive = False   # no packet in 2s → bat disconnected / out of range
        except Exception:
            pass             # malformed packet → skip


# ─────────────────────────────────────────────
# MODE B: Serial/USB (cable — fallback)
# ─────────────────────────────────────────────

def _serial_reader():
    """Read JSON lines from Arduino over USB serial. Auto-reconnects on disconnect."""
    global _alive
    import serial as _serial
    while True:
        try:
            with _serial.Serial(SERIAL_PORT, SERIAL_BAUD, timeout=1) as ser:
                _alive = True
                print(f"[bat_reader] Serial mode — connected on {SERIAL_PORT}")
                while True:
                    line = ser.readline().decode("utf-8", errors="ignore").strip()
                    if line.startswith("{"):
                        try:
                            bat_data.update(json.loads(line))
                        except Exception:
                            pass   # malformed JSON → skip
        except Exception:
            _alive = False
            time.sleep(2)          # retry on USB disconnect — auto-reconnect


# ─────────────────────────────────────────────
# Start the correct reader based on config
# ─────────────────────────────────────────────

if BAT_MODE == "udp":
    threading.Thread(target=_udp_reader, daemon=True).start()
else:
    threading.Thread(target=_serial_reader, daemon=True).start()


def bat_is_alive() -> bool:
    """Returns True if bat sensor data is being received."""
    return _alive
