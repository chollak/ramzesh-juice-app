#!/bin/bash
set -e

echo "🚀 Deploying Juice Telegram App..."

APP_DIR="/opt/juice-telegram-bot"
FRONTEND_DIR="/var/www/juice-app"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Deploy frontend
echo "📦 Deploying frontend to $FRONTEND_DIR..."
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/* $FRONTEND_DIR/
sudo chown -R www-data:www-data $FRONTEND_DIR

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

# Create logs directory if it doesn't exist
mkdir -p logs

# Deploy bot with PM2
echo "🤖 Deploying bot..."
if pm2 list | grep -q "juice-telegram-bot"; then
    pm2 restart juice-telegram-bot
else
    pm2 start ecosystem.config.cjs
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 Bot status:"
pm2 status
echo ""
echo "📝 View logs:"
echo "  pm2 logs juice-telegram-bot"
echo ""
echo "🌐 Your app is available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
