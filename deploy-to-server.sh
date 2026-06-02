#!/bin/bash
set -euo pipefail

# SnappyFresh Deployment Script (AWS Optimized)
# Builds locally and deploys to AWS with PM2 auto-restart
# Server: 13.247.190.131 (AWS) | Port: 3000 | Domain: snappyfresh.net
# NOTE: Preserves production optimizations (global nginx, Redis, etc)

source "$(dirname "$0")/../_deploy_lib.sh"

# Configuration
SERVER_IP="13.247.190.131"
SERVER_USER="ubuntu"
REMOTE_PATH="/var/www/snappyfresh"
LOCAL_PROJECT="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="snappyfresh.net"

print_header "SnappyFresh Deployment"
echo "Server:       ${SERVER_USER}@${SERVER_IP}"
echo "Path:         ${REMOTE_PATH}"
echo "Domain:       ${DOMAIN}"
echo "App Type:     Next.js 15 (Node.js)"
echo ""

# Validation
validate_ssh || exit 1

# Step 1: Build locally
print_step "Step 1: Building optimized production bundle"
cd "$LOCAL_PROJECT"

rm -rf .next node_modules/.cache

export NODE_ENV=production
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-https://yomilk.erpona.com:8092/api/}"
export NEXT_PUBLIC_IMAGE_CDN="${NEXT_PUBLIC_IMAGE_CDN:-https://yomilk.erpona.com:3330}"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --legacy-peer-deps 2>&1 | tail -3
fi

echo "Building Next.js bundle..."
npm run build 2>&1 | tail -10

if [ ! -d ".next" ]; then
    print_error "Build failed"
    exit 1
fi

BUILD_SIZE=$(du -sh .next | cut -f1)
print_success "Build complete - Hybrid Static+API mode (${BUILD_SIZE})"
echo "  - Static assets (/_next/static/) → Nginx (365d cache)"
echo "  - API & Dynamic routes → Node.js server"

# Step 2: Upload via rsync
print_step "Step 2: Uploading build to server"
smart_rsync "$LOCAL_PROJECT" "$REMOTE_PATH"

# Step 3: Deploy on server
print_step "Step 3: Deploying on server"
ssh ${SERVER_USER}@${SERVER_IP} << 'DEPLOY'
    cd /var/www/snappyfresh

    # Install dependencies
    npm ci --legacy-peer-deps 2>&1 | tail -2

    # Restart PM2 process
    pm2 restart snappyfresh || pm2 start npm --name "snappyfresh" -- start

    # Save PM2 state
    pm2 save

    sleep 2
    echo ""
    echo "PM2 Status:"
    pm2 list | tail -3
DEPLOY

print_success "Deployment complete"

# Step 4: Verify
print_step "Verifying deployment"
ssh ${SERVER_USER}@${SERVER_IP} << 'VERIFY'
    echo "Service health:"
    curl -s http://localhost:3000/ -I | head -3 && echo "✓ Service responding" || echo "⚠ Service not responding"

    echo ""
    echo "Nginx status:"
    sudo systemctl is-active nginx > /dev/null && echo "✓ Nginx active" || echo "⚠ Nginx not active"
VERIFY

print_header "✓ SnappyFresh Deployment Complete!"
echo ""
echo "Live:"
echo "  https://${DOMAIN}"
echo ""
echo "Logs:"
echo "  ssh ${SERVER_USER}@${SERVER_IP} pm2 logs snappyfresh"
echo ""
echo "Restart (if needed):"
echo "  ssh ${SERVER_USER}@${SERVER_IP} pm2 restart snappyfresh"
echo ""
