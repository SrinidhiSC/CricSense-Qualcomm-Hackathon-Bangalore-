# backend/models/frame.py - WebSocket frame models (matches frontend TypeScript interfaces)

from typing import Optional, Literal
from pydantic import BaseModel, Field


class Landmark(BaseModel):
    """Single MediaPipe pose landmark (normalized 0-1 coordinates)"""
    x: float = Field(..., ge=0.0, le=1.0, description="Normalized x coordinate")
    y: float = Field(..., ge=0.0, le=1.0, description="Normalized y coordinate")
    z: float = Field(..., description="Depth coordinate")
    visibility: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


class BatData(BaseModel):
    """Bat IMU sensor data from Arduino UNO Q (200Hz JSON)"""
    swing: float = Field(..., description="Acceleration magnitude in g-force")
    wrist: float = Field(..., description="Wrist angle proxy (degrees)")
    wristRate: float = Field(..., description="Angular velocity in deg/s")
    impact: int = Field(..., description="Impact flag: 0 or 1")


class Metrics(BaseModel):
    """Body pose metrics computed from landmarks"""
    elbow: float = Field(..., description="Front elbow angle in degrees (ideal: 100-130)")
    knee: float = Field(..., description="Front knee angle in degrees (ideal: 140-160)")
    head: Literal["over front knee", "falling away", "-"] = Field(
        ..., description="Head position relative to front knee"
    )


class CoachingCue(BaseModel):
    """A coaching cue generated for a shot"""
    text: str = Field(..., description="Coaching instruction text")
    lang: Literal["hi", "en"] = Field(..., description="Language: Hindi or English")
    source: Literal["llm", "rule"] = Field(
        ..., description="LLM from NPU or rule-based fallback"
    )


class SarvamExchange(BaseModel):
    """Sarvam Hindi Q&A exchange"""
    question: str = Field(..., description="Hindi question from player (ASR transcript)")
    reply: str = Field(..., description="Hindi coaching reply from LLM")
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")


class DeviceStatus(BaseModel):
    """Device connection status"""
    arduino: bool = Field(..., description="Arduino UNO Q bat sensor connected")
    phone: bool = Field(..., description="OnePlus 15 MediaPipe pose connected")
    npu: bool = Field(..., description="NPU LLM (AnythingLLM/Llama.cpp) available")
    cloud: bool = Field(..., description="Cirrascale Cloud AI 100 reachable")


class WSFrame(BaseModel):
    """
    Complete frame payload sent via WebSocket from backend to frontend.
    Broadcast at ~30 FPS (33ms intervals).
    """
    keypoints: Optional[list[Landmark]] = Field(
        None, description="33 MediaPipe landmarks, null when no person detected"
    )
    metrics: Metrics = Field(..., description="Computed pose metrics")
    bat: BatData = Field(..., description="Real-time bat sensor data")
    coaching: Optional[CoachingCue] = Field(
        None, description="Non-null only when impact detected"
    )
    devices: DeviceStatus = Field(..., description="Device connection status")
    sarvam: Optional[SarvamExchange] = Field(
        None, description="Non-null when Hindi exchange just completed"
    )
    phase: Literal["startup", "tracking", "shot_detected", "qa_active", "report"] = Field(
        ..., description="Current session phase - drives dashboard display state"
    )
    llmStatus: Literal["idle", "thinking", "replied"] = Field(
        ..., description="LLM status during Q&A - for 'Thinking...' spinner"
    )
    pendingQuestion: Optional[str] = Field(
        None, description="Hindi question text while LLM is thinking"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "keypoints": None,
                "metrics": {"elbow": 118.0, "knee": 162.0, "head": "over front knee"},
                "bat": {"swing": 3.2, "wrist": 87.3, "wristRate": 412.1, "impact": 0},
                "coaching": None,
                "devices": {"arduino": True, "phone": False, "npu": True, "cloud": True},
                "sarvam": None,
                "phase": "startup",
                "llmStatus": "idle",
                "pendingQuestion": None,
            }
        }
