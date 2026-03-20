from kiteconnect import KiteConnect
from app.config import KITE_API_KEY, KITE_API_SECRET

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
    return data


def is_authenticated() -> bool:
    return _access_token is not None


def require_kite() -> KiteConnect:
    """Return the authenticated KiteConnect instance or raise."""
    kite = get_kite()
    if _access_token is None:
        raise RuntimeError("Not authenticated. Complete Kite login first.")
    return kite
