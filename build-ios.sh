#!/bin/bash
# iOS Build Script - Run this to build and see full output

cd "$(dirname "$0")"

# Load Node.js 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Add CocoaPods to PATH
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"

echo "=========================================="
echo "iOS Build Script"
echo "=========================================="
echo "Node.js: $(node --version)"
echo "CocoaPods: $(pod --version 2>/dev/null || echo 'Not found')"
echo "Xcode: $(xcodebuild -version | head -1)"
echo "=========================================="
echo ""

# Check if simulator is booted
DEVICE_ID="FAD82D3D-3CD9-4436-9440-7DF113658E91"
DEVICE_STATUS=$(xcrun simctl list devices | grep "$DEVICE_ID" | grep -o "Booted\|Shutdown")

if [ "$DEVICE_STATUS" != "Booted" ]; then
    echo "⚠️  Simulator not booted. Booting iPhone 15..."
    xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true
    sleep 2
fi

echo "🚀 Starting iOS build..."
echo "This may take 10-15 minutes on first build"
echo ""

# Run the build
npx expo run:ios --device "$DEVICE_ID"

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build succeeded! App should be running on simulator."
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi

