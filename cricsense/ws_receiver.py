# ws_receiver.py — WebSocket server that receives pose keypoints from OnePlus 15
# Also handles Hindi coaching questions forwarded from the phone.
# Runs on laptop (Toolbox A, x64 venv) on port WS_PORT (default 8765).
import asyncio
import json
import websockets
from config import WS_PORT

# Shared buffer — main.py reads from this list every frame
keypoints_buffer: list = []

# Shared reference to latest metrics — updated by main.py so ws_receiver can reply
_latest_metrics: dict = {"elbow": 0, "knee": 0, "head": "-"}
_latest_bat:     dict = {}


def set_latest(metrics: dict, bat: dict):
    """Called by main.py to keep ws_receiver in sync with current pose/bat state."""
    _latest_metrics.update(metrics)
    _latest_bat.update(bat)


async def _handle(websocket):
    async for message in websocket:
        try:
            data = json.loads(message)
        except Exception:
            continue   # EDGE: malformed JSON → skip frame

        if "keypoints" in data:
            keypoints_buffer.clear()
            keypoints_buffer.extend(data["keypoints"])

        elif data.get("type") == "question":
            # Hindi coaching question from phone — generate reply and send back
            from coaching import get_coaching
            from config import COACHING_LANG

            # Use last-known metrics to answer the question
            cue = get_coaching(_latest_metrics, _latest_bat)
            await websocket.send(json.dumps({"coaching": cue}))


async def _serve():
    async with websockets.serve(_handle, "0.0.0.0", WS_PORT):
        print(f"[ws_receiver] Listening on port {WS_PORT}")
        await asyncio.Future()   # run forever


def start_ws():
    """Entry point — call in a daemon thread from main.py."""
    asyncio.run(_serve())
