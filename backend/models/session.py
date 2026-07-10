# backend/models/session.py - Session and shot models

from typing import Optional
from pydantic import BaseModel, Field
from .frame import CoachingCue


class Shot(BaseModel):
    """A single shot logged during a session"""
    id: str = Field(..., description="UUID")
    shotNumber: int = Field(..., ge=1, description="Shot number in session (1-indexed)")
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")
    elbow: float = Field(..., description="Elbow angle in degrees")
    knee: float = Field(..., description="Knee angle in degrees")
    head: str = Field(..., description="Head position string")
    swingSpeed: float = Field(..., description="Swing speed in g-force")
    wristSnap: float = Field(..., description="Wrist angular velocity in deg/s")
    coaching: CoachingCue = Field(..., description="Coaching cue for this shot")
    isGoodShot: bool = Field(
        ..., description="True if elbow AND knee both in ideal range"
    )


class CloudReport(BaseModel):
    """Cloud report from Cirrascale (Qualcomm Cloud AI 100) - end of session"""
    mostCommonFlaw: str = Field(..., description="E.g., 'Knee angle too high'")
    mostCommonFlawDetail: str = Field(
        ..., description="E.g., 'avg 162° vs ideal 155°'"
    )
    improvement: str = Field(..., description="E.g., 'Elbow angle improved'")
    improvementDetail: str = Field(
        ..., description="E.g., 'Shot 1: 88° → Shot 5: 112°'"
    )
    drillRecommendation: str = Field(
        ..., description="E.g., 'Front knee bend drill against wall'"
    )
    rating: float = Field(..., ge=0.0, le=10.0, description="Session rating 1-10")
    rawText: str = Field(..., description="Full report text from cloud model")
    generatedAt: int = Field(..., description="Unix timestamp in milliseconds")
    # Derived stats
    avgElbow: float = Field(..., description="Average elbow angle across all shots")
    avgKnee: float = Field(..., description="Average knee angle across all shots")
    avgSwing: float = Field(..., description="Average swing speed across all shots")
    firstShotElbow: float = Field(..., description="First shot elbow for comparison")
    lastShotElbow: float = Field(..., description="Last shot elbow for comparison")


class Session(BaseModel):
    """Complete session object"""
    id: str = Field(..., description="UUID")
    playerId: str = Field(..., description="Player UUID")
    date: str = Field(..., description="ISO date string (YYYY-MM-DD)")
    startTime: int = Field(..., description="Unix timestamp in milliseconds")
    endTime: int = Field(..., description="Unix timestamp in milliseconds")
    shots: list[Shot] = Field(default_factory=list, description="All shots in session")
    cloudReport: Optional[CloudReport] = Field(
        None, description="Cloud-generated report, null if not yet generated"
    )
    recordingKey: Optional[str] = Field(
        None, description="Recording filename key, null if no recording"
    )

    @property
    def duration(self) -> int:
        """Session duration in seconds"""
        return (self.endTime - self.startTime) // 1000

    @property
    def shot_count(self) -> int:
        """Total shots in session"""
        return len(self.shots)
