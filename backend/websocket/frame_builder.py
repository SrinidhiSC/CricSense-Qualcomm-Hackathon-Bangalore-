# backend/websocket/frame_builder.py - Build WSFrame from backend data

from typing import Optional
from datetime import datetime
from models import (
    WSFrame,
    Landmark,
    BatData,
    Metrics,
    CoachingCue,
    SarvamExchange,
    DeviceStatus,
)
from config import SessionPhase, LLMStatus


class FrameBuilder:
    """
    Builds WSFrame objects from backend data.
    Manages phase transitions and state tracking.
    """
    
    def __init__(self):
        self.current_phase: str = SessionPhase.STARTUP
        self.llm_status: str = LLMStatus.IDLE
        self.pending_question: Optional[str] = None
        self.latest_sarvam: Optional[SarvamExchange] = None
        self.latest_coaching: Optional[CoachingCue] = None
    
    def build_frame(
        self,
        keypoints: Optional[list[Landmark]],
        metrics: Metrics,
        bat: BatData,
        devices: DeviceStatus,
    ) -> WSFrame:
        """
        Build a complete WSFrame from current backend state.
        
        This method is called at ~30 FPS by the WebSocket broadcaster.
        """
        # Determine phase based on current state
        self._update_phase(keypoints, bat, devices)
        
        # Build frame
        frame = WSFrame(
            keypoints=keypoints,
            metrics=metrics,
            bat=bat,
            coaching=self.latest_coaching,
            devices=devices,
            sarvam=self.latest_sarvam,
            phase=self.current_phase,
            llmStatus=self.llm_status,
            pendingQuestion=self.pending_question,
        )
        
        # Clear one-time events after broadcasting
        if self.latest_coaching and self.current_phase != SessionPhase.SHOT_DETECTED:
            self.latest_coaching = None
        
        if self.latest_sarvam and self.llm_status == LLMStatus.REPLIED:
            # Keep sarvam in frame for a few seconds, then clear
            pass  # TODO: Add timer to clear after 5 seconds
        
        return frame
    
    def _update_phase(
        self,
        keypoints: Optional[list[Landmark]],
        bat: BatData,
        devices: DeviceStatus,
    ):
        """Update session phase based on current state"""
        # Phase 1: STARTUP - no devices or no player
        if not devices.arduino or not devices.phone:
            self.current_phase = SessionPhase.STARTUP
            return
        
        if keypoints is None:
            self.current_phase = SessionPhase.STARTUP
            return
        
        # Phase 4: QA_ACTIVE - Hindi question/answer
        if self.llm_status in [LLMStatus.THINKING, LLMStatus.REPLIED]:
            self.current_phase = SessionPhase.QA_ACTIVE
            return
        
        # Phase 3: SHOT_DETECTED - impact detected
        if bat.impact == 1:
            self.current_phase = SessionPhase.SHOT_DETECTED
            return
        
        # Phase 2: TRACKING - normal operation
        if keypoints is not None:
            self.current_phase = SessionPhase.TRACKING
            return
    
    def on_shot_detected(self, coaching: CoachingCue):
        """Called when a shot is detected and coaching cue is generated"""
        self.latest_coaching = coaching
        self.current_phase = SessionPhase.SHOT_DETECTED
    
    def on_hindi_question(self, question: str):
        """Called when player asks a Hindi question"""
        self.pending_question = question
        self.llm_status = LLMStatus.THINKING
        self.current_phase = SessionPhase.QA_ACTIVE
    
    def on_hindi_reply(self, question: str, reply: str):
        """Called when Hindi reply is generated"""
        self.pending_question = None
        self.llm_status = LLMStatus.REPLIED
        self.latest_sarvam = SarvamExchange(
            question=question,
            reply=reply,
            timestamp=int(datetime.now().timestamp() * 1000),
        )
        self.current_phase = SessionPhase.QA_ACTIVE
    
    def on_session_end(self):
        """Called when session ends"""
        self.current_phase = SessionPhase.REPORT
    
    def reset(self):
        """Reset to initial state"""
        self.current_phase = SessionPhase.STARTUP
        self.llm_status = LLMStatus.IDLE
        self.pending_question = None
        self.latest_sarvam = None
        self.latest_coaching = None
