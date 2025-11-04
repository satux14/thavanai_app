#!/bin/bash
# Quick setup script to ensure Node.js 20 is used

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 20
nvm use 20

# Verify Node.js version
echo "Node.js version: $(node --version)"
echo "Node.js path: $(which node)"

# Test Expo
echo ""
echo "Testing Expo..."
npx expo --version

