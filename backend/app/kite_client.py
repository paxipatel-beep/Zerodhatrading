from kiteconnect import KiteConnect
from app.config import KITE_API_KEY, KITE_API_SECRET
from app import session_store

_kite: KiteConnect | None = None
_access_token: str | None = None


def get_kite() -> KiteConnect:
    global _kite
    if _kite is None:
        _kite = KiteConnect(api_key=KITE_API_KEY)
    return _kite


def get_login_url() -> str:
    return get_kite().login_url()


def generate_session(request_token: str) -> dict:
    global _access_token
    kite = get_kite()
    data = kite.generate_session(request_token, api_secret=KITE_API_SECRET)
    _access_token = data["access_token"]
    kite.set_access_token(_access_token)
    session_store.save(_access_token, data.get("user_id", "default"))
    return data


def restore_session() -> bool:
    global _access_token
    saved = session_store.load()
    if saved and saved.get("access_token"):
        _access_token = saved["access_token"]
        get_kite().set_access_token(_access_token)
        return True
    return False


def is_authenticated() -> bool:
    if _access_token is not None:
        return True
    return restore_session()


def require_kite() -> KiteConnect:
    """Return the authenticated KiteConnect instance or raise."""
    kite = get_kite()
    if _access_token is None and not restore_session():
        raise RuntimeError("Not authenticated. Complete Kite login first.")
    return kite
