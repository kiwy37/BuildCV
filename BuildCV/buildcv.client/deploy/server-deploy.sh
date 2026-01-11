#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=/home/ubuntu/BuildCV/BuildCV
FRONTEND_DIR=$REPO_DIR/buildcv.client
BACKEND_CSPROJ=$REPO_DIR/BuildCV.Server/BuildCV.Server.csproj
PUBLISH_DIR=/opt/buildcv.server
WEB_ROOT=/var/www/buildcv.client

cd "$REPO_DIR"

# If dotnet is not available, attempt to install (tries SDK 8.0 then 7.0)
if ! command -v dotnet >/dev/null 2>&1; then
	# requires sudo
	echo "dotnet not found — attempting to install (requires sudo)..."
	sudo wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O /tmp/packages-microsoft-prod.deb
	sudo dpkg -i /tmp/packages-microsoft-prod.deb || true
	sudo apt update

	if sudo apt install -y dotnet-sdk-8.0; then
		echo "Installed dotnet-sdk-8.0"
	elif sudo apt install -y dotnet-sdk-7.0; then
		echo "Installed dotnet-sdk-7.0"
	else
		echo "Automatic dotnet install failed. Please install dotnet manually (example: 'sudo apt install dotnet-sdk-8.0') and re-run the script."
		exit 1
	fi
fi

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
