#!/bin/bash

# Snappy Fresh - Remote Deployment Script
# This script SSH into your cPanel server and runs the installation

HOST="cp69-jhb.za-dns.com"
USER="snappyfr"
PASS="-O85zk5SR5[hfX"

echo "🚀 Snappy Fresh Remote Deployment"
echo "=================================="
echo ""
echo "Connecting to: $HOST"
echo "User: $USER"
echo ""

# Try multiple SSH connection methods
echo "Attempting SSH connection..."

# Method 1: Direct SSH (requires sshpass)
if command -v sshpass &> /dev/null; then
    echo "Using sshpass..."
    sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$USER@$HOST" << 'EOFCMD'
cd ~/public_html
echo "📦 Extracting deployment package..."
tar -xzf deployment-src.tar.gz
rm deployment-src.tar.gz

echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building application..."
npm run build

echo "✅ Build complete! Starting server..."
npm start
EOFCMD
else
    echo "❌ sshpass not found. Install it:"
    echo "   macOS: brew install sshpass"
    echo "   Linux: apt-get install sshpass"
    echo "   Windows: Use WSL or Git Bash"
    exit 1
fi
