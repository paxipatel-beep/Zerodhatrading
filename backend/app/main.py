from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import FRONTEND_URL
from app.kite_client import (
    generate_session,
    get_login_url,
    is_authenticated,
    require_kite,
)

app = FastAPI(title="Zerodha Trading Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ─────────────────────────────────────────────────────────────────

@app.get("/api/login")
def login():
    """Return the Kite login URL."""
    return {"login_url": get_login_url()}


@app.get("/api/callback")
def callback(request_token: str = Query(...)):
    """Handle Kite OAuth callback, then redirect to frontend."""
    try:
        generate_session(request_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return RedirectResponse(url=f"{FRONTEND_URL}?auth=success")


@app.get("/api/auth/status")
def auth_status():
    return {"authenticated": is_authenticated()}


# ── Profile ──────────────────────────────────────────────────────────────

@app.get("/api/profile")
def profile():
    kite = require_kite()
    return kite.profile()


# ── Portfolio ────────────────────────────────────────────────────────────

@app.get("/api/holdings")
def holdings():
    kite = require_kite()
    return kite.holdings()


@app.get("/api/positions")
def positions():
    kite = require_kite()
    return kite.positions()


# ── Orders ───────────────────────────────────────────────────────────────

@app.get("/api/orders")
def orders():
    kite = require_kite()
    return kite.orders()


@app.get("/api/trades")
def trades():
    kite = require_kite()
    return kite.trades()


# ── Market data ──────────────────────────────────────────────────────────

@app.get("/api/quote")
def quote(instruments: str = Query(..., description="Comma-separated, e.g. NSE:RELIANCE,NSE:TCS")):
    kite = require_kite()
    symbols = [s.strip() for s in instruments.split(",")]
    return kite.quote(symbols)


@app.get("/api/ohlc")
def ohlc(instruments: str = Query(..., description="Comma-separated instruments")):
    kite = require_kite()
    symbols = [s.strip() for s in instruments.split(",")]
    return kite.ohlc(symbols)


@app.get("/api/ltp")
def ltp(instruments: str = Query(..., description="Comma-separated instruments")):
    kite = require_kite()
    symbols = [s.strip() for s in instruments.split(",")]
    return kite.ltp(symbols)


# ── Margins ──────────────────────────────────────────────────────────────

@app.get("/api/margins")
def margins():
    kite = require_kite()
    return kite.margins()


# ── Health ───────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "authenticated": is_authenticated()}
