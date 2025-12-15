#!/bin/bash
set -e

echo "🚀 Deploying Juice Telegram App (для существующего сервера с nginx)..."

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

echo "📦 Installing dependencies..."
npm ci --production

echo "🏗️ Building frontend..."
npm run build

echo "📦 Deploying frontend to $FRONTEND_DIR..."
sudo mkdir -p $FRONTEND_DIR
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/* $FRONTEND_DIR/
sudo chown -R www-data:www-data $FRONTEND_DIR

echo ""
echo "⚙️ Настройка nginx:"
echo "1. Выберите один из вариантов конфигурации:"
echo "   - deploy/nginx-subdomain.conf (поддомен, например juice.yourdomain.com)"
echo "   - deploy/nginx-path.conf (путь, например yourdomain.com/juice-app)"
echo "   - deploy/nginx-port.conf (порт 8080, например yourdomain.com:8080)"
echo ""
echo "2. Для поддомена:"
echo "   sudo cp deploy/nginx-subdomain.conf /etc/nginx/sites-available/juice-app"
echo "   # Отредактируйте файл, замените server_name"
echo "   sudo ln -sf /etc/nginx/sites-available/juice-app /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo "   # Получите SSL: sudo certbot --nginx -d juice.yourdomain.com"
echo ""
echo "3. Для пути: добавьте содержимое nginx-path.conf в существующий конфиг"
echo ""
echo "4. Для порта: sudo cp deploy/nginx-port.conf /etc/nginx/sites-available/juice-app"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🤖 Deploying bot..."
# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

if pm2 list | grep -q "juice-telegram-bot"; then
    pm2 restart juice-telegram-bot
else
    pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Bot status:"
pm2 status
echo ""
echo "📝 View logs:"
echo "  pm2 logs juice-telegram-bot"
echo ""
echo "🌐 Не забудьте настроить nginx (см. инструкции выше)!"
