"""File-based session persistence for Kite access tokens."""

import json
import os
from pathlib import Path

SESSION_DIR = Path(os.getenv("DATA_DIR", "/data"))
SESSION_FILE = SESSION_DIR / "session.json"


def save(access_token: str, user_id: str = "default") -> None:
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    SESSION_FILE.write_text(json.dumps({
        "access_token": access_token,
        "user_id": user_id,
    }))


def load() -> dict | None:
    try:
        if SESSION_FILE.exists():
            data = json.loads(SESSION_FILE.read_text())
            if data.get("access_token"):
                return data
    except (json.JSONDecodeError, OSError):
        pass
    return None


def clear() -> None:
    try:
        SESSION_FILE.unlink(missing_ok=True)
    except OSError:
        pass
