#!/bin/bash
set -e

echo "🔄 Updating Juice Telegram App..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Run deployment
echo "🚀 Running deployment..."
./deploy/scripts/deploy.sh

echo "✅ Update complete!"
