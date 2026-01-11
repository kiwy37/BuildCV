#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=/home/ubuntu/BuildCV/BuildCV
FRONTEND_DIR=$REPO_DIR/buildcv.client
BACKEND_CSPROJ=$REPO_DIR/BuildCV.Server/BuildCV.Server.csproj
PUBLISH_DIR=/opt/buildcv.server
WEB_ROOT=/var/www/buildcv.client

cd "$REPO_DIR"
git pull origin main

# Build frontend
cd "$FRONTEND_DIR"
npm ci
npm run build -- --configuration production

# Sync frontend
sudo mkdir -p "$WEB_ROOT"
sudo rsync -a dist/buildcv.client/ "$WEB_ROOT/"
sudo chown -R www-data:www-data "$WEB_ROOT"

# Publish backend
dotnet publish "$BACKEND_CSPROJ" -c Release -o "$PUBLISH_DIR"
sudo chown -R www-data:www-data "$PUBLISH_DIR"

# Deploy services
sudo cp deploy/buildcv-backend.service /etc/systemd/system/buildcv-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now buildcv-backend
sudo cp deploy/nginx.buildcv.client.conf /etc/nginx/sites-available/buildcv.client
sudo ln -sf /etc/nginx/sites-available/buildcv.client /etc/nginx/sites-enabled/buildcv.client
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy finished."
