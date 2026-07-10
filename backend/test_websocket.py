#!/usr/bin/env python
"""Test WebSocket connection to backend server"""

import asyncio
import websockets
import json

async def test_websocket():
    """Test WebSocket connection"""
    uri = "ws://localhost:8766"
    
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Wait for a few frames
            print("\nReceiving frames...")
            for i in range(5):
                message = await websocket.recv()
                data = json.loads(message)
                print(f"\nFrame {i+1}:")
                print(f"  Phase: {data.get('phase')}")
                print(f"  Devices: {data.get('devices')}")
                print(f"  LLM Status: {data.get('llmStatus')}")
                print(f"  Keypoints: {len(data.get('keypoints', [])) if data.get('keypoints') else 0}")
            
            print("\n✅ WebSocket test passed!")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
