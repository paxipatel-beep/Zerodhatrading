import os
from dotenv import load_dotenv

load_dotenv()

KITE_API_KEY = os.getenv("KITE_API_KEY", "")
KITE_API_SECRET = os.getenv("KITE_API_SECRET", "")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "change-me")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
