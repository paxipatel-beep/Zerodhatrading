#!/bin/bash
# Setup script for Zerodha Dashboard with SSL
# Run this on your VPS after cloning the repo

DOMAIN="srv1380590.hstgr.cloud"
EMAIL="admin@$DOMAIN"

echo "=== Zerodha Dashboard SSL Setup ==="

# Step 1: Start with HTTP-only nginx to get SSL cert
echo "[1/4] Starting services with HTTP-only config..."
cp nginx/initial.conf nginx/default.conf.bak
cp nginx/initial.conf nginx/default.conf
docker compose up -d backend nginx

echo "[2/4] Requesting SSL certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

if [ $? -ne 0 ]; then
  echo "ERROR: SSL certificate generation failed."
  echo "Make sure DNS for $DOMAIN points to this server's IP."
  exit 1
fi

# Step 3: Switch to HTTPS nginx config
echo "[3/4] Switching to HTTPS config..."
cp nginx/default.conf.bak nginx/default.conf
rm nginx/default.conf.bak

# Step 4: Restart nginx with SSL
echo "[4/4] Restarting nginx with SSL..."
docker compose restart nginx

echo ""
echo "=== DONE ==="
echo "Dashboard is live at: https://$DOMAIN"
echo "Kite redirect URL:    https://$DOMAIN/api/callback"
echo ""
echo "To renew SSL (run monthly): docker compose run --rm certbot renew && docker compose restart nginx"
