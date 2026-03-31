"""Supabase client for persistent storage."""

from datetime import datetime, timedelta, timezone
from app.config import SUPABASE_URL, SUPABASE_KEY

_client = None


def get_client():
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            return None
        from supabase import create_client
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


# ── Trade History ────────────────────────────────────────────────────────

def log_trade(order_data: dict) -> None:
    client = get_client()
    if not client:
        return
    try:
        client.table("trade_history").insert({
            "tradingsymbol": order_data.get("tradingsymbol"),
            "exchange": order_data.get("exchange", "NSE"),
            "transaction_type": order_data.get("transaction_type"),
            "quantity": order_data.get("quantity"),
            "price": order_data.get("price"),
            "order_type": order_data.get("order_type"),
            "order_id": order_data.get("order_id"),
            "status": "PLACED",
        }).execute()
    except Exception:
        pass


def get_trade_history(days: int = 30) -> list:
    client = get_client()
    if not client:
        return []
    try:
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        result = client.table("trade_history") \
            .select("*") \
            .gte("created_at", since) \
            .order("created_at", desc=True) \
            .execute()
        return result.data or []
    except Exception:
        return []


# ── Price Alerts ─────────────────────────────────────────────────────────

def create_alert(instrument: str, condition: str, target_price: float) -> dict | None:
    client = get_client()
    if not client:
        return None
    try:
        result = client.table("price_alerts").insert({
            "instrument": instrument,
            "condition": condition,
            "target_price": target_price,
        }).execute()
        return result.data[0] if result.data else None
    except Exception:
        return None


def get_alerts() -> list:
    client = get_client()
    if not client:
        return []
    try:
        result = client.table("price_alerts") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()
        return result.data or []
    except Exception:
        return []


def delete_alert(alert_id: int) -> bool:
    client = get_client()
    if not client:
        return False
    try:
        client.table("price_alerts").delete().eq("id", alert_id).execute()
        return True
    except Exception:
        return False


def trigger_alert(alert_id: int) -> None:
    client = get_client()
    if not client:
        return
    try:
        client.table("price_alerts").update({
            "triggered": True,
            "triggered_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", alert_id).execute()
    except Exception:
        pass


# ── Portfolio Snapshots ──────────────────────────────────────────────────

def save_portfolio_snapshot(total_investment: float, current_value: float,
                            pnl: float, pnl_pct: float, snapshot_date: str) -> None:
    client = get_client()
    if not client:
        return
    try:
        client.table("portfolio_snapshots").upsert({
            "user_id": "default",
            "total_investment": total_investment,
            "current_value": current_value,
            "pnl": pnl,
            "pnl_pct": pnl_pct,
            "snapshot_date": snapshot_date,
        }, on_conflict="user_id,snapshot_date").execute()
    except Exception:
        pass


def get_portfolio_history(days: int = 90) -> list:
    client = get_client()
    if not client:
        return []
    try:
        since = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
        result = client.table("portfolio_snapshots") \
            .select("*") \
            .gte("snapshot_date", since) \
            .order("snapshot_date", desc=False) \
            .execute()
        return result.data or []
    except Exception:
        return []
