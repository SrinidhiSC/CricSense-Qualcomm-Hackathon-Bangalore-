# backend/models/player.py - Player models

from typing import Literal, Optional
from pydantic import BaseModel, Field


class Player(BaseModel):
    """Player profile"""
    id: str = Field(..., description="UUID")
    name: str = Field(..., min_length=1, max_length=30, description="Player name")
    age: int = Field(..., ge=8, le=60, description="Player age")
    hand: Literal["right", "left"] = Field(..., description="Dominant hand")
    skillLevel: Literal["Beginner", "Amateur", "Club", "Semi-Pro"] = Field(
        ..., description="Skill level"
    )
    avatarIndex: int = Field(..., ge=0, le=5, description="Avatar icon index 0-5")
    createdAt: int = Field(..., description="Unix timestamp in milliseconds")
    sessionIds: list[str] = Field(
        default_factory=list, description="Ordered list of session IDs"
    )


class PlayerStats(BaseModel):
    """Aggregated player statistics (derived, not stored)"""
    totalSessions: int = Field(..., ge=0, description="Total sessions played")
    totalShots: int = Field(..., ge=0, description="Total shots across all sessions")
    avgElbow: float = Field(..., description="Average elbow angle across all sessions")
    avgKnee: float = Field(..., description="Average knee angle across all sessions")
    bestSwingSpeed: float = Field(..., description="Highest swing speed recorded")
    lastSessionDate: Optional[str] = Field(
        None, description="ISO date string of last session, null if no sessions"
    )
    avgRating: float = Field(
        ..., ge=0.0, le=10.0, description="Average session rating"
    )
