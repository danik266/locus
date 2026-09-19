#!/usr/bin/env bash
set -e

SERVER="root@46.101.134.38"
REMOTE_DIR="/var/www/continue"

echo "🚀 [1/4] Building Next.js standalone..."
npm run build

echo "📦 [2/4] Syncing build to server ($SERVER:$REMOTE_DIR)..."
rsync -avz --delete --exclude='.env.production' .next/standalone/ "$SERVER:$REMOTE_DIR/"
rsync -avz .next/static/ "$SERVER:$REMOTE_DIR/.next/static/"
rsync -avz public/ "$SERVER:$REMOTE_DIR/public/"
scp ecosystem.config.cjs "$SERVER:$REMOTE_DIR/"

echo "🔄 [3/4] Reloading PM2 process on server..."
ssh "$SERVER" "cd $REMOTE_DIR && pm2 restart ecosystem.config.cjs --update-env"

echo "🔍 [4/4] Verifying production health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://continue.46.101.134.38.sslip.io/)
if [ "$STATUS" = "200" ]; then
  echo "✅ Deployment successful! Site is live at:"
  echo "   🌐 https://continue.46.101.134.38.sslip.io"
else
  echo "⚠️ Warning: Health check returned status $STATUS"
fi
