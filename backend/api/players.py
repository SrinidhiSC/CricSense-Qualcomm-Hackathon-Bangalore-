# backend/api/players.py - Player management endpoints

from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from pydantic import BaseModel, Field
import uuid

from models import Player, PlayerStats
import database as db


class CreatePlayerRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    age: int = Field(..., ge=8, le=60)
    hand: str = Field(..., pattern="^(right|left)$")
    skillLevel: str = Field(..., pattern="^(Beginner|Amateur|Club|Semi-Pro)$")
    avatarIndex: int = Field(..., ge=0, le=5)

router = APIRouter(prefix="/api/players", tags=["Players"])


@router.get("", response_model=List[Player])
async def get_all_players():
    """
    Get all players.
    
    Returns list of all registered players.
    """
    players = db.get_all_players()
    return players


@router.get("/{player_id}", response_model=Player)
async def get_player(player_id: str):
    """
    Get player by ID.
    
    - **player_id**: Player UUID
    """
    player = db.get_player(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player {player_id} not found"
        )
    return player


@router.post("", response_model=Player, status_code=status.HTTP_201_CREATED)
async def create_player(request: CreatePlayerRequest):
    """
    Create a new player.
    
    - **name**: Player name (1-30 characters)
    - **age**: Player age (8-60)
    - **hand**: Dominant hand ("right" or "left")
    - **skillLevel**: "Beginner" | "Amateur" | "Club" | "Semi-Pro"
    - **avatarIndex**: Avatar icon index (0-5)
    """
    
    player = Player(
        id=str(uuid.uuid4()),
        name=request.name,
        age=request.age,
        hand=request.hand,  # type: ignore
        skillLevel=request.skillLevel,  # type: ignore
        avatarIndex=request.avatarIndex,
        createdAt=int(datetime.now().timestamp() * 1000),
        sessionIds=[],
    )
    
    db.create_player(player)
    return player


@router.put("/{player_id}", response_model=Player)
async def update_player(
    player_id: str,
    name: str = None,
    age: int = None,
    skillLevel: str = None,
    avatarIndex: int = None,
):
    """
    Update player fields.
    
    - **player_id**: Player UUID
    - All fields are optional (only provided fields will be updated)
    """
    player = db.get_player(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player {player_id} not found"
        )
    
    update_data = {}
    if name is not None:
        if not (1 <= len(name) <= 30):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name must be 1-30 characters"
            )
        update_data["name"] = name
    
    if age is not None:
        if not (8 <= age <= 60):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Age must be between 8 and 60"
            )
        update_data["age"] = age
    
    if skillLevel is not None:
        if skillLevel not in ["Beginner", "Amateur", "Club", "Semi-Pro"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid skill level"
            )
        update_data["skillLevel"] = skillLevel
    
    if avatarIndex is not None:
        if not (0 <= avatarIndex <= 5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="avatarIndex must be 0-5"
            )
        update_data["avatarIndex"] = avatarIndex
    
    updated_player = db.update_player(player_id, update_data)
    return updated_player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_player(player_id: str):
    """
    Delete player and all their sessions.
    
    - **player_id**: Player UUID
    
    **WARNING**: This will permanently delete the player and all their session data.
    """
    success = db.delete_player(player_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player {player_id} not found"
        )
    return None


@router.get("/{player_id}/stats", response_model=PlayerStats)
async def get_player_stats(player_id: str):
    """
    Get aggregated player statistics.
    
    - **player_id**: Player UUID
    
    Returns:
    - Total sessions
    - Total shots
    - Average elbow/knee angles
    - Best swing speed
    - Last session date
    - Average rating
    """
    stats = db.get_player_stats(player_id)
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player {player_id} not found"
        )
    return stats
