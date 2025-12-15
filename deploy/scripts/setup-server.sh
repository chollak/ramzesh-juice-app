#!/bin/bash
set -e

echo "🚀 Setting up AWS EC2 server for Juice Telegram App..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
echo "📦 Installing nginx..."
sudo apt install -y nginx

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Git if not installed
echo "📦 Installing Git..."
sudo apt install -y git

# Create directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/juice-app
sudo mkdir -p /opt/juice-telegram-bot
sudo mkdir -p /opt/juice-telegram-bot/logs

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R $USER:$USER /var/www/juice-app
sudo chown -R $USER:$USER /opt/juice-telegram-bot

# Setup firewall
echo "🔥 Setting up firewall..."
sudo apt install -y ufw
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Configure nginx
echo "⚙️ Configuring nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /opt/juice-telegram-bot/deploy/nginx.conf /etc/nginx/sites-enabled/juice-app
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup PM2 startup
echo "⚙️ Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/juice-telegram-bot"
echo "2. Create .env file with your credentials"
echo "3. Run deploy.sh script"
