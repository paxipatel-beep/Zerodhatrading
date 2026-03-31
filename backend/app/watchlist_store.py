"""File-based watchlist persistence."""

import json
import os
from pathlib import Path

DATA_DIR = Path(os.getenv("DATA_DIR", "/data"))
WATCHLIST_FILE = DATA_DIR / "watchlist.json"

DEFAULT_INSTRUMENTS = [
    "NSE:NIFTY 50", "NSE:NIFTY BANK", "NSE:RELIANCE", "NSE:TCS",
    "NSE:INFY", "NSE:HDFCBANK", "NSE:ICICIBANK", "NSE:SBIN",
]


def _ensure_file() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not WATCHLIST_FILE.exists():
        WATCHLIST_FILE.write_text(json.dumps(DEFAULT_INSTRUMENTS))


def get() -> list[str]:
    _ensure_file()
    try:
        return json.loads(WATCHLIST_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return list(DEFAULT_INSTRUMENTS)


def save(instruments: list[str]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    WATCHLIST_FILE.write_text(json.dumps(instruments))


def add(instrument: str) -> list[str]:
    instruments = get()
    if instrument not in instruments:
        instruments.append(instrument)
        save(instruments)
    return instruments


def remove(instrument: str) -> list[str]:
    instruments = get()
    instruments = [i for i in instruments if i != instrument]
    save(instruments)
    return instruments
