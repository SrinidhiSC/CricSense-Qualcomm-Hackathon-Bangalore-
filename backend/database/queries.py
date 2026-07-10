# backend/database/queries.py - Neo4j Cypher query functions

from typing import Optional
from models import Player, Session, PlayerStats, Shot, CloudReport
from .db import get_driver
import config


# ═══════════════════════════════════════════════════════════════════════════
# PLAYER QUERIES
# ═══════════════════════════════════════════════════════════════════════════

def create_player(player: Player) -> Player:
    """Create a new player node"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        CREATE (p:Player {
            id: $id,
            name: $name,
            age: $age,
            hand: $hand,
            skillLevel: $skillLevel,
            avatarIndex: $avatarIndex,
            createdAt: $createdAt
        })
        RETURN p
        """
        session.run(query, **player.model_dump(exclude={"sessionIds"}))
    return player


def get_player(player_id: str) -> Optional[Player]:
    """Get player by ID with session relationships"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (p:Player {id: $player_id})
        OPTIONAL MATCH (p)-[:HAS_SESSION]->(s:Session)
        RETURN p, collect(s.id) as sessionIds
        """
        result = session.run(query, player_id=player_id).single()
        
        if not result:
            return None
        
        player_data = dict(result["p"])
        player_data["sessionIds"] = result["sessionIds"]
        return Player(**player_data)


def get_all_players() -> list[Player]:
    """Get all players with their sessions"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (p:Player)
        OPTIONAL MATCH (p)-[:HAS_SESSION]->(s:Session)
        RETURN p, collect(s.id) as sessionIds
        ORDER BY p.createdAt DESC
        """
        results = session.run(query)
        
        players = []
        for record in results:
            player_data = dict(record["p"])
            player_data["sessionIds"] = record["sessionIds"]
            players.append(Player(**player_data))
        
        return players


def update_player(player_id: str, update_data: dict) -> Optional[Player]:
    """Update player properties"""
    driver = get_driver()
    
    # Build SET clause dynamically
    set_clauses = [f"p.{key} = ${key}" for key in update_data.keys() if key != "sessionIds"]
    set_clause = ", ".join(set_clauses)
    
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = f"""
        MATCH (p:Player {{id: $player_id}})
        SET {set_clause}
        RETURN p
        """
        result = session.run(query, player_id=player_id, **update_data)
        
        if not result.single():
            return None
    
    return get_player(player_id)


def delete_player(player_id: str) -> bool:
    """Delete player and all their sessions/shots"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (p:Player {id: $player_id})
        OPTIONAL MATCH (p)-[:HAS_SESSION]->(s:Session)
        OPTIONAL MATCH (s)-[:HAS_SHOT]->(shot:Shot)
        DETACH DELETE p, s, shot
        RETURN count(p) as deleted
        """
        result = session.run(query, player_id=player_id).single()
        return result["deleted"] > 0


# ═══════════════════════════════════════════════════════════════════════════
# SESSION QUERIES
# ═══════════════════════════════════════════════════════════════════════════

def create_session(session: Session) -> Session:
    """Create a new session node and link to player"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as tx:
        # Create session node
        query = """
        MATCH (p:Player {id: $playerId})
        CREATE (s:Session {
            id: $id,
            playerId: $playerId,
            date: $date,
            startTime: $startTime,
            endTime: $endTime,
            recordingKey: $recordingKey
        })
        CREATE (p)-[:HAS_SESSION]->(s)
        RETURN s
        """
        tx.run(query, 
            id=session.id,
            playerId=session.playerId,
            date=session.date,
            startTime=session.startTime,
            endTime=session.endTime,
            recordingKey=session.recordingKey
        )
    
    return session


def get_session(session_id: str) -> Optional[Session]:
    """Get session by ID with all shots and cloud report"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (s:Session {id: $session_id})
        OPTIONAL MATCH (s)-[:HAS_SHOT]->(shot:Shot)
        RETURN s, collect(shot) as shots
        """
        result = session.run(query, session_id=session_id).single()
        
        if not result:
            return None
        
        session_data = dict(result["s"])
        
        # Parse shots
        shots = []
        for shot_node in result["shots"]:
            if shot_node:
                shot_dict = dict(shot_node)
                # Parse coaching cue
                if shot_dict.get("coaching_text"):
                    shot_dict["coaching"] = {
                        "text": shot_dict.pop("coaching_text"),
                        "lang": shot_dict.pop("coaching_lang"),
                        "source": shot_dict.pop("coaching_source")
                    }
                else:
                    shot_dict["coaching"] = None
                shots.append(Shot(**shot_dict))
        
        # Sort shots by shotNumber
        shots.sort(key=lambda shot: shot.shotNumber)
        
        session_data["shots"] = shots
        
        # Parse cloud report if exists
        if session_data.get("cloudReport_rawText"):
            session_data["cloudReport"] = CloudReport(
                mostCommonFlaw=session_data.pop("cloudReport_mostCommonFlaw", ""),
                mostCommonFlawDetail=session_data.pop("cloudReport_mostCommonFlawDetail", ""),
                improvement=session_data.pop("cloudReport_improvement", ""),
                improvementDetail=session_data.pop("cloudReport_improvementDetail", ""),
                drillRecommendation=session_data.pop("cloudReport_drillRecommendation", ""),
                rating=session_data.pop("cloudReport_rating", 0),
                rawText=session_data.pop("cloudReport_rawText"),
                generatedAt=session_data.pop("cloudReport_generatedAt"),
                avgElbow=session_data.pop("cloudReport_avgElbow", 0.0),
                avgKnee=session_data.pop("cloudReport_avgKnee", 0.0),
                avgSwing=session_data.pop("cloudReport_avgSwing", 0.0),
                firstShotElbow=session_data.pop("cloudReport_firstShotElbow", 0.0),
                lastShotElbow=session_data.pop("cloudReport_lastShotElbow", 0.0)
            )
        else:
            session_data["cloudReport"] = None
        
        return Session(**session_data)


def get_sessions_by_player(
    player_id: str, limit: Optional[int] = None, offset: int = 0
) -> list[Session]:
    """Get all sessions for a player (newest first)"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (p:Player {id: $player_id})-[:HAS_SESSION]->(s:Session)
        RETURN s.id as session_id
        ORDER BY s.startTime DESC
        SKIP $offset
        """
        if limit:
            query += " LIMIT $limit"
        
        results = session.run(query, player_id=player_id, offset=offset, limit=limit)
        
        sessions = []
        for record in results:
            sess = get_session(record["session_id"])
            if sess:
                sessions.append(sess)
        
        return sessions


def get_all_sessions(limit: Optional[int] = None, offset: int = 0) -> list[Session]:
    """Get all sessions (newest first)"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (s:Session)
        RETURN s.id as session_id
        ORDER BY s.startTime DESC
        SKIP $offset
        """
        if limit:
            query += " LIMIT $limit"
        
        results = session.run(query, offset=offset, limit=limit)
        
        sessions = []
        for record in results:
            sess = get_session(record["session_id"])
            if sess:
                sessions.append(sess)
        
        return sessions


def update_session(session_id: str, update_data: dict) -> Optional[Session]:
    """Update session properties"""
    driver = get_driver()
    
    # Handle shots separately
    shots = update_data.pop("shots", None)
    cloud_report = update_data.pop("cloudReport", None)
    
    with driver.session(database=config.NEO4J_DATABASE) as session:
        # Update basic session properties
        if update_data:
            set_clauses = [f"s.{key} = ${key}" for key in update_data.keys()]
            set_clause = ", ".join(set_clauses)
            
            query = f"""
            MATCH (s:Session {{id: $session_id}})
            SET {set_clause}
            RETURN s
            """
            session.run(query, session_id=session_id, **update_data)
        
        # Add shots if provided
        if shots:
            for shot in shots:
                shot_query = """
                MATCH (s:Session {id: $session_id})
                CREATE (shot:Shot {
                    id: $id,
                    shotNumber: $shotNumber,
                    timestamp: $timestamp,
                    elbow: $elbow,
                    knee: $knee,
                    head: $head,
                    swingSpeed: $swingSpeed,
                    wristSnap: $wristSnap,
                    coaching_text: $coaching_text,
                    coaching_lang: $coaching_lang,
                    coaching_source: $coaching_source,
                    isGoodShot: $isGoodShot
                })
                CREATE (s)-[:HAS_SHOT]->(shot)
                """
                shot_dict = shot.model_dump() if hasattr(shot, 'model_dump') else shot
                coaching = shot_dict.get("coaching", {})
                session.run(shot_query,
                    session_id=session_id,
                    id=shot_dict["id"],
                    shotNumber=shot_dict["shotNumber"],
                    timestamp=shot_dict["timestamp"],
                    elbow=shot_dict["elbow"],
                    knee=shot_dict["knee"],
                    head=shot_dict["head"],
                    swingSpeed=shot_dict["swingSpeed"],
                    wristSnap=shot_dict["wristSnap"],
                    coaching_text=coaching.get("text", "") if coaching else "",
                    coaching_lang=coaching.get("lang", "en") if coaching else "en",
                    coaching_source=coaching.get("source", "rule") if coaching else "rule",
                    isGoodShot=shot_dict["isGoodShot"]
                )
        
        # Add cloud report if provided
        if cloud_report:
            report_dict = cloud_report.model_dump() if hasattr(cloud_report, 'model_dump') else cloud_report
            report_query = """
            MATCH (s:Session {id: $session_id})
            SET s.cloudReport_mostCommonFlaw = $mostCommonFlaw,
                s.cloudReport_mostCommonFlawDetail = $mostCommonFlawDetail,
                s.cloudReport_improvement = $improvement,
                s.cloudReport_improvementDetail = $improvementDetail,
                s.cloudReport_drillRecommendation = $drillRecommendation,
                s.cloudReport_rating = $rating,
                s.cloudReport_rawText = $rawText,
                s.cloudReport_generatedAt = $generatedAt,
                s.cloudReport_avgElbow = $avgElbow,
                s.cloudReport_avgKnee = $avgKnee,
                s.cloudReport_avgSwing = $avgSwing,
                s.cloudReport_firstShotElbow = $firstShotElbow,
                s.cloudReport_lastShotElbow = $lastShotElbow
            """
            session.run(report_query, session_id=session_id, **report_dict)
    
    return get_session(session_id)


def delete_session(session_id: str) -> bool:
    """Delete session and all its shots"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        query = """
        MATCH (s:Session {id: $session_id})
        OPTIONAL MATCH (s)-[:HAS_SHOT]->(shot:Shot)
        DETACH DELETE s, shot
        RETURN count(s) as deleted
        """
        result = session.run(query, session_id=session_id).single()
        return result["deleted"] > 0


# ═══════════════════════════════════════════════════════════════════════════
# STATS QUERIES
# ═══════════════════════════════════════════════════════════════════════════

def get_player_stats(player_id: str) -> Optional[PlayerStats]:
    """Calculate aggregated player statistics using Cypher"""
    driver = get_driver()
    with driver.session(database=config.NEO4J_DATABASE) as session:
        # Check if player exists
        player_check = session.run("MATCH (p:Player {id: $player_id}) RETURN p", player_id=player_id).single()
        if not player_check:
            return None
        
        # Aggregate stats query
        query = """
        MATCH (p:Player {id: $player_id})-[:HAS_SESSION]->(s:Session)
        OPTIONAL MATCH (s)-[:HAS_SHOT]->(shot:Shot)
        WITH p, s, shot
        ORDER BY s.startTime DESC
        WITH p, 
             count(DISTINCT s) as totalSessions,
             count(shot) as totalShots,
             avg(shot.elbow) as avgElbow,
             avg(shot.knee) as avgKnee,
             max(shot.swingSpeed) as bestSwingSpeed,
             collect(DISTINCT s)[0] as lastSession,
             avg(s.cloudReport_rating) as avgRating
        RETURN totalSessions,
               totalShots,
               avgElbow,
               avgKnee,
               bestSwingSpeed,
               lastSession.date as lastSessionDate,
               avgRating
        """
        result = session.run(query, player_id=player_id).single()
        
        if not result:
            return PlayerStats(
                totalSessions=0,
                totalShots=0,
                avgElbow=0.0,
                avgKnee=0.0,
                bestSwingSpeed=0.0,
                lastSessionDate=None,
                avgRating=0.0,
            )
        
        return PlayerStats(
            totalSessions=result["totalSessions"] or 0,
            totalShots=result["totalShots"] or 0,
            avgElbow=result["avgElbow"] or 0.0,
            avgKnee=result["avgKnee"] or 0.0,
            bestSwingSpeed=result["bestSwingSpeed"] or 0.0,
            lastSessionDate=result["lastSessionDate"],
            avgRating=result["avgRating"] or 0.0,
        )
