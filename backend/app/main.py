from datetime import date, datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.config import FRONTEND_URL
from app.kite_client import (
    generate_session,
    get_login_url,
    is_authenticated,
    require_kite,
)
from app import watchlist_store, supabase_client

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(title="Zerodha Trading Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Error handling ──────────────────────────────────────────────────────

@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    if "Not authenticated" in str(exc):
        return JSONResponse(status_code=401, content={"error": "session_expired"})
    return JSONResponse(status_code=500, content={"error": str(exc)})


def safe_kite():
    """Get kite client, raising 401 on auth failure."""
    try:
        return require_kite()
    except RuntimeError:
        raise HTTPException(status_code=401, detail="session_expired")


# ── Auth ─────────────────────────────────────────────────────────────────

@app.get("/api/login")
def login():
    return {"login_url": get_login_url()}


@app.get("/api/callback")
def callback(request_token: str = Query(...)):
    try:
        generate_session(request_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return RedirectResponse(url="/?auth=success")


@app.get("/api/auth/status")
def auth_status():
    return {"authenticated": is_authenticated()}


# ── Profile ──────────────────────────────────────────────────────────────

@app.get("/api/profile")
def profile():
    return safe_kite().profile()


# ── Portfolio ────────────────────────────────────────────────────────────

@app.get("/api/holdings")
def holdings():
    return safe_kite().holdings()


@app.get("/api/positions")
def positions():
    return safe_kite().positions()


# ── Orders ───────────────────────────────────────────────────────────────

@app.get("/api/orders")
def orders():
    return safe_kite().orders()


@app.get("/api/trades")
def trades():
    return safe_kite().trades()


class PlaceOrderRequest(BaseModel):
    tradingsymbol: str
    exchange: str = "NSE"
    transaction_type: str  # BUY or SELL
    quantity: int
    order_type: str = "MARKET"  # MARKET, LIMIT, SL, SL-M
    price: float | None = None
    trigger_price: float | None = None
    product: str = "CNC"  # CNC, MIS, NRML


@app.post("/api/orders/place")
def place_order(req: PlaceOrderRequest):
    kite = safe_kite()
    params = {
        "variety": "regular",
        "tradingsymbol": req.tradingsymbol,
        "exchange": req.exchange,
        "transaction_type": req.transaction_type,
        "quantity": req.quantity,
        "order_type": req.order_type,
        "product": req.product,
    }
    if req.price is not None:
        params["price"] = req.price
    if req.trigger_price is not None:
        params["trigger_price"] = req.trigger_price

    try:
        order_id = kite.place_order(**params)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Log to Supabase
    supabase_client.log_trade({**req.model_dump(), "order_id": str(order_id)})

    return {"order_id": order_id, "status": "PLACED"}


@app.delete("/api/orders/{order_id}")
def cancel_order(order_id: str):
    kite = safe_kite()
    try:
        kite.cancel_order(variety="regular", order_id=order_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"order_id": order_id, "status": "CANCELLED"}


# ── Market data ──────────────────────────────────────────────────────────

@app.get("/api/quote")
def quote(instruments: str = Query(...)):
    return safe_kite().quote([s.strip() for s in instruments.split(",")])


@app.get("/api/ohlc")
def ohlc(instruments: str = Query(...)):
    return safe_kite().ohlc([s.strip() for s in instruments.split(",")])


@app.get("/api/ltp")
def ltp(instruments: str = Query(...)):
    return safe_kite().ltp([s.strip() for s in instruments.split(",")])


# ── Margins ──────────────────────────────────────────────────────────────

@app.get("/api/margins")
def margins():
    return safe_kite().margins()


# ── Watchlist ────────────────────────────────────────────────────────────

@app.get("/api/watchlist")
def get_watchlist():
    return {"instruments": watchlist_store.get()}


class AddInstrumentRequest(BaseModel):
    instrument: str


@app.post("/api/watchlist/add")
def add_to_watchlist(req: AddInstrumentRequest):
    instruments = watchlist_store.add(req.instrument)
    return {"instruments": instruments}


@app.delete("/api/watchlist/{instrument:path}")
def remove_from_watchlist(instrument: str):
    instruments = watchlist_store.remove(instrument)
    return {"instruments": instruments}


@app.get("/api/instruments/search")
def search_instruments(q: str = Query(..., min_length=1)):
    """Search Kite instruments. Cached in memory after first load."""
    kite = safe_kite()
    if not hasattr(search_instruments, "_cache"):
        try:
            search_instruments._cache = kite.instruments()
        except Exception:
            search_instruments._cache = []

    query = q.upper()
    results = []
    for inst in search_instruments._cache:
        if query in (inst.get("tradingsymbol", "") or "").upper():
            results.append({
                "tradingsymbol": inst["tradingsymbol"],
                "exchange": inst["exchange"],
                "name": inst.get("name", ""),
                "instrument_key": f"{inst['exchange']}:{inst['tradingsymbol']}",
            })
            if len(results) >= 20:
                break
    return results


# ── Trade History ────────────────────────────────────────────────────────

@app.get("/api/history")
def trade_history(days: int = Query(30, ge=1, le=365)):
    return supabase_client.get_trade_history(days)


# ── Price Alerts ─────────────────────────────────────────────────────────

class CreateAlertRequest(BaseModel):
    instrument: str
    condition: str  # "above" or "below"
    target_price: float


@app.get("/api/alerts")
def get_alerts():
    return supabase_client.get_alerts()


@app.post("/api/alerts")
def create_alert(req: CreateAlertRequest):
    if req.condition not in ("above", "below"):
        raise HTTPException(status_code=400, detail="condition must be 'above' or 'below'")
    alert = supabase_client.create_alert(req.instrument, req.condition, req.target_price)
    if alert is None:
        raise HTTPException(status_code=500, detail="Failed to create alert")
    return alert


@app.delete("/api/alerts/{alert_id}")
def delete_alert(alert_id: int):
    if not supabase_client.delete_alert(alert_id):
        raise HTTPException(status_code=500, detail="Failed to delete alert")
    return {"status": "deleted"}


# ── Portfolio History ────────────────────────────────────────────────────

@app.get("/api/portfolio/history")
def portfolio_history(days: int = Query(90, ge=1, le=365)):
    return supabase_client.get_portfolio_history(days)


# ── Background Jobs ─────────────────────────────────────────────────────

def check_alerts():
    """Check price alerts against current LTP."""
    try:
        alerts = supabase_client.get_alerts()
        active = [a for a in alerts if not a.get("triggered")]
        if not active:
            return

        instruments = list({a["instrument"] for a in active})
        kite = require_kite()
        ltps = kite.ltp(instruments)

        for alert in active:
            ltp_data = ltps.get(alert["instrument"])
            if not ltp_data:
                continue
            price = ltp_data["last_price"]
            if alert["condition"] == "above" and price >= alert["target_price"]:
                supabase_client.trigger_alert(alert["id"])
            elif alert["condition"] == "below" and price <= alert["target_price"]:
                supabase_client.trigger_alert(alert["id"])
    except Exception:
        pass


def snapshot_portfolio():
    """Take daily portfolio snapshot."""
    try:
        kite = require_kite()
        holdings_data = kite.holdings()
        if not holdings_data:
            return

        total_inv = sum(h["average_price"] * h["quantity"] for h in holdings_data)
        current_val = sum(h["last_price"] * h["quantity"] for h in holdings_data)
        pnl = current_val - total_inv
        pnl_pct = (pnl / total_inv * 100) if total_inv > 0 else 0

        supabase_client.save_portfolio_snapshot(
            total_investment=total_inv,
            current_value=current_val,
            pnl=pnl,
            pnl_pct=pnl_pct,
            snapshot_date=date.today().isoformat(),
        )
    except Exception:
        pass


@app.on_event("startup")
def startup():
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.cron import CronTrigger
    from apscheduler.triggers.interval import IntervalTrigger

    scheduler = BackgroundScheduler()
    # Check price alerts every 15 seconds during market hours (9:15 - 15:30 IST)
    scheduler.add_job(check_alerts, IntervalTrigger(seconds=15))
    # Snapshot portfolio at 15:35 IST on weekdays
    scheduler.add_job(snapshot_portfolio, CronTrigger(
        hour=15, minute=35, day_of_week="mon-fri", timezone="Asia/Kolkata"
    ))
    scheduler.start()


# ── Health ───────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "authenticated": is_authenticated()}


# ── Dashboard UI ────────────────────────────────────────────────────────

@app.get("/")
def serve_dashboard():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
