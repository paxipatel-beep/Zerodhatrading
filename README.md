# Zerodha Trading Dashboard

Full-featured trading dashboard powered by Kite Connect. Works on Mac, iPhone (PWA), and can be hosted on a VPS.

## Architecture

```
frontend/   → Next.js 14 (React, Tailwind CSS, SWR)
backend/    → Python FastAPI + KiteConnect SDK
nginx/      → Reverse proxy config (production)
```

## Features

- Portfolio holdings with P&L tracking
- Open positions monitoring
- Order history
- Market watchlist with live quotes
- Account margins overview
- Responsive design (works on desktop & mobile)
- PWA support (add to home screen on iPhone)
- Auto-refreshing data

## Quick Start (Local — Mac)

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure your Kite credentials
cp .env.example .env
# Edit .env with your KITE_API_KEY and KITE_API_SECRET

uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install

# Optional: configure API URL
cp .env.example .env.local

npm run dev
```

Open http://localhost:3000 — click "Login with Kite" to authenticate.

### iPhone Access (Local Network)

Run with your Mac's local IP:
```bash
# Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
npm run dev -- --hostname 0.0.0.0
```
Access from iPhone at `http://<your-mac-ip>:3000`. Add to Home Screen for PWA experience.

## Deploy to VPS (Docker)

```bash
# 1. Clone to your VPS
git clone <repo-url> && cd Zerodhatrading

# 2. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
# Set FRONTEND_URL to your domain

# 3. Start services
docker compose up -d

# 4. With Nginx reverse proxy (production)
docker compose --profile production up -d
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `KITE_API_KEY` | Your Kite Connect API key |
| `KITE_API_SECRET` | Your Kite Connect API secret |
| `APP_SECRET_KEY` | Random secret for session security |
| `FRONTEND_URL` | Frontend URL for CORS & redirects |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |

## Kite Login Flow

1. User clicks "Login with Kite" → redirected to Zerodha login page
2. After login, Kite redirects to `/api/callback` with a request token
3. Backend exchanges token for access token via KiteConnect SDK
4. User is redirected back to the dashboard
