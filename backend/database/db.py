# backend/database/db.py - Neo4j database connection and initialization

from neo4j import GraphDatabase, Driver
from typing import Optional
import config

# Global database driver
_driver: Optional[Driver] = None


def init_database():
    """Initialize Neo4j driver and create constraints. Call once at application startup."""
    global _driver
    
    try:
        _driver = GraphDatabase.driver(
            config.NEO4J_URI,
            auth=(config.NEO4J_USER, config.NEO4J_PASSWORD)
        )
        
        # Verify connection
        _driver.verify_connectivity()
        
        # Create constraints and indexes
        with _driver.session(database=config.NEO4J_DATABASE) as session:
            # Player constraints
            session.run("""
                CREATE CONSTRAINT player_id IF NOT EXISTS
                FOR (p:Player) REQUIRE p.id IS UNIQUE
            """)
            
            # Session constraints
            session.run("""
                CREATE CONSTRAINT session_id IF NOT EXISTS
                FOR (s:Session) REQUIRE s.id IS UNIQUE
            """)
            
            # Shot constraints
            session.run("""
                CREATE CONSTRAINT shot_id IF NOT EXISTS
                FOR (shot:Shot) REQUIRE shot.id IS UNIQUE
            """)
            
            # Indexes for performance
            session.run("""
                CREATE INDEX player_name IF NOT EXISTS
                FOR (p:Player) ON (p.name)
            """)
            
            session.run("""
                CREATE INDEX session_start_time IF NOT EXISTS
                FOR (s:Session) ON (s.startTime)
            """)
        
        print(f"[Database] Connected to Neo4j at {config.NEO4J_URI}")
        print(f"[Database] Using database: {config.NEO4J_DATABASE}")
        
        # Count nodes
        with _driver.session(database=config.NEO4J_DATABASE) as session:
            player_count = session.run("MATCH (p:Player) RETURN count(p) as count").single()["count"]
            session_count = session.run("MATCH (s:Session) RETURN count(s) as count").single()["count"]
            print(f"[Database] Players: {player_count} nodes")
            print(f"[Database] Sessions: {session_count} nodes")
            
    except Exception as e:
        print(f"[Database] ERROR: Failed to connect to Neo4j: {e}")
        raise


def get_driver() -> Driver:
    """Get Neo4j driver instance"""
    if _driver is None:
        init_database()
    return _driver


def close_database():
    """Close Neo4j driver. Call on application shutdown."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None
        print("[Database] Closed Neo4j connection")
