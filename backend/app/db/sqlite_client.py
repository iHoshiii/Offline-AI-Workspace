import asyncio
import json
import sqlite3
from pathlib import Path
from typing import Any
from app.config import CHAT_DB_PATH

DB_LOCK = asyncio.Lock()

CREATE_SCHEMA = """
CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);
"""

async def _execute(statement: str, params: tuple = (), fetch_one: bool = False, fetch_all: bool = False, commit: bool = True, is_script: bool = False) -> Any:
    async with DB_LOCK:
        def _run() -> Any:
            conn = sqlite3.connect(CHAT_DB_PATH, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if is_script:
                cursor.executescript(statement)
            else:
                cursor.execute(statement, params)
            
            if commit:
                conn.commit()
            
            if is_script:
                result = None
            elif fetch_one:
                result = cursor.fetchone()
            elif fetch_all:
                result = cursor.fetchall()
            else:
                result = cursor.lastrowid
            conn.close()
            return result

        return await asyncio.to_thread(_run)

async def init_db() -> None:
    CHAT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    await _execute(CREATE_SCHEMA, commit=True, is_script=True)

async def create_chat(title: str) -> int:
    query = "INSERT INTO chats (title) VALUES (?)"
    return await _execute(query, (title,))

async def list_chats() -> list[dict[str, Any]]:
    query = "SELECT id, title, created_at, updated_at FROM chats ORDER BY updated_at DESC"
    rows = await _execute(query, fetch_all=True)
    return [dict(row) for row in rows]

async def get_chat(chat_id: int) -> dict[str, Any] | None:
    query = "SELECT id, title, created_at, updated_at FROM chats WHERE id = ?"
    row = await _execute(query, (chat_id,), fetch_one=True)
    return dict(row) if row else None

async def append_message(chat_id: int, role: str, content: str) -> int:
    query = "INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)"
    message_id = await _execute(query, (chat_id, role, content))
    await _execute("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (chat_id,))
    return message_id

async def get_messages(chat_id: int, limit: int = 20) -> list[dict[str, Any]]:
    query = "SELECT id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT ?"
    rows = await _execute(query, (chat_id, limit), fetch_all=True)
    return [dict(row) for row in reversed(rows)]

async def find_or_create_chat(title: str) -> int:
    query = "SELECT id FROM chats WHERE title = ? LIMIT 1"
    row = await _execute(query, (title,), fetch_one=True)
    if row:
        return int(row["id"])
    return await create_chat(title)

async def delete_chat(chat_id: int) -> bool:
    query = "DELETE FROM chats WHERE id = ?"
    await _execute(query, (chat_id,))
    return True

async def delete_message(message_id: int) -> bool:
    # First get the content so we can delete the corresponding memory
    query_content = "SELECT content FROM messages WHERE id = ?"
    row = await _execute(query_content, (message_id,), fetch_one=True)
    if row:
        content = row["content"]
        # Delete message
        await _execute("DELETE FROM messages WHERE id = ?", (message_id,))
        # Delete memories that contain this content (best effort sync)
        await _execute("DELETE FROM memories WHERE content LIKE ?", (f"%{content}%",))
        return True
    return False

async def update_chat_title(chat_id: int, title: str) -> bool:
    query = "UPDATE chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    await _execute(query, (title, chat_id))
    return True

async def add_memory(chat_id: int, content: str, embedding: list[float]) -> int:
    query = "INSERT INTO memories (chat_id, content, embedding) VALUES (?, ?, ?)"
    return await _execute(query, (chat_id, content, json.dumps(embedding)))

async def list_all_memories() -> list[dict[str, Any]]:
    query = "SELECT chat_id, content, embedding FROM memories"
    rows = await _execute(query, fetch_all=True)
    return [dict(row) for row in rows]
