# backend/websocket/server.py - WebSocket server for frontend real-time streaming

import asyncio
import json
import websockets
from typing import Set, Optional
from websockets.server import WebSocketServerProtocol
import logging

from models import WSFrame
from .frame_builder import FrameBuilder
import config

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections to frontend clients.
    Broadcasts WSFrame data at ~30 FPS to all connected clients.
    """
    
    def __init__(self):
        self.clients: Set[WebSocketServerProtocol] = set()
        self.frame_builder = FrameBuilder()
        self.is_running = False
        self._broadcast_task: Optional[asyncio.Task] = None
    
    async def register(self, websocket: WebSocketServerProtocol):
        """Register a new client connection"""
        self.clients.add(websocket)
        logger.info(f"[WebSocket] Client connected. Total clients: {len(self.clients)}")
        
        try:
            # Keep connection alive and handle incoming messages
            async for message in websocket:
                await self._handle_client_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.unregister(websocket)
    
    def unregister(self, websocket: WebSocketServerProtocol):
        """Unregister a client connection"""
        self.clients.discard(websocket)
        logger.info(f"[WebSocket] Client disconnected. Total clients: {len(self.clients)}")
    
    async def _handle_client_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle incoming messages from clients"""
        try:
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "start_recording":
                logger.info("[WebSocket] Client requested recording start")
                # TODO: Notify backend bridge to start recording
            
            elif msg_type == "stop_recording":
                logger.info("[WebSocket] Client requested recording stop")
                # TODO: Notify backend bridge to stop recording
            
            elif msg_type == "trigger_report":
                logger.info("[WebSocket] Client requested session report")
                self.frame_builder.on_session_end()
            
            elif msg_type == "ping":
                # Respond to ping
                await websocket.send(json.dumps({"type": "pong"}))
            
        except json.JSONDecodeError:
            logger.warning(f"[WebSocket] Invalid JSON from client: {message}")
        except Exception as e:
            logger.exception("[WebSocket] Error handling message")
    
    async def broadcast(self, frame: WSFrame):
        """Broadcast a frame to all connected clients"""
        if not self.clients:
            return  # No clients connected
        
        # Serialize frame to JSON
        frame_json = frame.model_dump_json()
        
        # Send to all clients
        disconnected = set()
        for client in self.clients:
            try:
                await client.send(frame_json)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
            except Exception:
                logger.exception("[WebSocket] Error broadcasting to client")
                disconnected.add(client)
        
        # Clean up disconnected clients
        for client in disconnected:
            self.clients.discard(client)
    
    async def broadcast_loop(self):
        """
        Main broadcast loop - runs at ~30 FPS.
        Gets data from backend bridge and broadcasts to all clients.
        """
        logger.info("[WebSocket] Broadcast loop started")
        frame_interval = 1.0 / config.WS_FRAME_RATE  # ~0.033 seconds for 30 FPS
        
        while self.is_running:
            try:
                # Get latest data from backend bridge
                from bridge.backend_bridge import get_latest_frame_data
                
                frame_data = get_latest_frame_data()
                
                if frame_data:
                    # Build WSFrame
                    frame = self.frame_builder.build_frame(
                        keypoints=frame_data.get("keypoints"),
                        metrics=frame_data["metrics"],
                        bat=frame_data["bat"],
                        devices=frame_data["devices"],
                    )
                    
                    # Broadcast to all clients
                    await self.broadcast(frame)
                
                # Sleep to maintain frame rate
                await asyncio.sleep(frame_interval)
                
            except Exception:
                logger.exception("[WebSocket] Error in broadcast loop")
                await asyncio.sleep(frame_interval)
        
        logger.info("[WebSocket] Broadcast loop stopped")
    
    def start_broadcast(self):
        """Start the broadcast loop"""
        self.is_running = True
        self._broadcast_task = asyncio.create_task(self.broadcast_loop())
    
    def stop_broadcast(self):
        """Stop the broadcast loop"""
        self.is_running = False
        if self._broadcast_task:
            self._broadcast_task.cancel()


# Global WebSocket manager instance
ws_manager = WebSocketManager()


async def websocket_handler(websocket: WebSocketServerProtocol):
    """Handler for new WebSocket connections"""
    await ws_manager.register(websocket)


async def start_websocket_server():
    """
    Start the WebSocket server.
    Called from main.py on startup.
    """
    # Start broadcast loop
    ws_manager.start_broadcast()
    
    # Start WebSocket server
    async with websockets.serve(
        websocket_handler,
        config.WS_HOST,
        config.WS_PORT,
        ping_interval=20,  # Send ping every 20 seconds
        ping_timeout=10,   # Close connection if no pong in 10 seconds
    ):
        logger.info(f"[WebSocket] Server listening on ws://{config.WS_HOST}:{config.WS_PORT}")
        await asyncio.Future()  # Run forever
