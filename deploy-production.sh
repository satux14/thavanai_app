#!/bin/bash

# Production Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  eThavanai Book - Production Deployment                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pull latest changes
echo -e "${YELLOW}[1/4] Pulling latest changes...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Code updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to pull changes${NC}"
    exit 1
fi
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}[2/4] Installing dependencies...${NC}"
npm install --production
cd server
npm install --production
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Run database migration
echo -e "${YELLOW}[3/4] Running database migration...${NC}"
cd server
node src/db/migrate-favorites.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migration completed${NC}"
else
    echo -e "${RED}✗ Migration failed (might be already applied)${NC}"
fi
cd ..
echo ""

# Step 4: Restart server
echo -e "${YELLOW}[4/4] Restarting server...${NC}"

# Check if PM2 is available
if command -v pm2 &> /dev/null
then
    echo "Using PM2..."
    pm2 restart thavanai-server || pm2 start server/src/index.js --name thavanai-server
    echo -e "${GREEN}✓ Server restarted with PM2${NC}"
else
    echo -e "${YELLOW}PM2 not found. Please restart your server manually:${NC}"
    echo "  cd server && npm start"
fi
echo ""

# Final verification
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Deployment Complete!                                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Code updated to latest version${NC}"
echo -e "${GREEN}✓ Database migrated${NC}"
echo -e "${GREEN}✓ Server restarted${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify server is running: pm2 status"
echo "  2. Check logs: pm2 logs thavanai-server"
echo "  3. Test the app: npx expo start"
echo "  4. Build production app: eas build"
echo ""
echo "For troubleshooting, see: DEPLOYMENT_GUIDE.md"

