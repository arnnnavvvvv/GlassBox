import json
import sqlite3
from contextlib import contextmanager
from typing import Optional

import psycopg2
import psycopg2.extras

from . import config

USING_POSTGRES = bool(config.DATABASE_URL)

SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    onchain_id INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    action TEXT NOT NULL,
    verdict INTEGER NOT NULL,
    decision_hash TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""

POSTGRES_SCHEMA = """
CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    onchain_id INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    action TEXT NOT NULL,
    verdict INTEGER NOT NULL,
    decision_hash TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""


@contextmanager
def get_connection():
    if USING_POSTGRES:
        conn = psycopg2.connect(config.DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    else:
        conn = sqlite3.connect(config.DB_PATH)
        conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    with get_connection() as conn:
        if USING_POSTGRES:
            with conn.cursor() as cur:
                cur.execute(POSTGRES_SCHEMA)
        else:
            conn.execute(SQLITE_SCHEMA)
        conn.commit()


def insert_decision(
    onchain_id: int,
    agent_id: str,
    action: str,
    verdict: int,
    decision_hash: str,
    tx_hash: str,
    payload: dict,
    created_at: str,
) -> int:
    payload_json = json.dumps(payload)
    with get_connection() as conn:
        if USING_POSTGRES:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO decisions
                        (onchain_id, agent_id, action, verdict, decision_hash, tx_hash, payload, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (onchain_id, agent_id, action, verdict, decision_hash, tx_hash, payload_json, created_at),
                )
                row_id = cur.fetchone()["id"]
            conn.commit()
            return row_id
        else:
            cursor = conn.execute(
                """
                INSERT INTO decisions
                    (onchain_id, agent_id, action, verdict, decision_hash, tx_hash, payload, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (onchain_id, agent_id, action, verdict, decision_hash, tx_hash, payload_json, created_at),
            )
            conn.commit()
            return cursor.lastrowid


def get_decision(decision_id: int) -> Optional[dict]:
    with get_connection() as conn:
        if USING_POSTGRES:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM decisions WHERE id = %s", (decision_id,))
                row = cur.fetchone()
        else:
            row = conn.execute("SELECT * FROM decisions WHERE id = ?", (decision_id,)).fetchone()
        return _row_to_dict(row) if row else None


def list_decisions() -> list:
    with get_connection() as conn:
        if USING_POSTGRES:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM decisions ORDER BY id ASC")
                rows = cur.fetchall()
        else:
            rows = conn.execute("SELECT * FROM decisions ORDER BY id ASC").fetchall()
        return [_row_to_dict(row) for row in rows]


def _row_to_dict(row) -> dict:
    payload = json.loads(row["payload"])
    return {
        "id": row["id"],
        "onchainId": row["onchain_id"],
        "agentId": row["agent_id"],
        "action": row["action"],
        "verdict": row["verdict"],
        "price": payload.get("decision", {}).get("price"),
        "decisionHash": row["decision_hash"],
        "txHash": row["tx_hash"],
        "payload": payload,
        "createdAt": row["created_at"],
    }
