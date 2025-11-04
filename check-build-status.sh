#!/bin/bash
# Quick script to check if iOS build is running and its status

echo "=========================================="
echo "iOS Build Status Check"
echo "=========================================="
echo ""

# Check if xcodebuild is running
if pgrep -f "xcodebuild.*eThavanaiBookDailyLedger" > /dev/null; then
    echo "✅ Build is RUNNING"
    echo ""
    echo "Active processes:"
    ps aux | grep -E "xcodebuild|clang.*eThavanai" | grep -v grep | head -5 | awk '{print "  PID", $2, "-", $11, $12, $13, $14}'
    echo ""
    echo "To see full build output, check Xcode or run:"
    echo "  tail -f ~/Library/Developer/Xcode/DerivedData/eThavanaiBookDailyLedger-*/Logs/Build/*.xcactivitylog"
else
    echo "❌ No build process found"
    echo ""
    echo "To start a build, run:"
    echo "  ./build-ios.sh"
    echo "  or"
    echo "  npx expo run:ios"
fi

echo ""
echo "Simulator Status:"
xcrun simctl list devices | grep "iPhone 15" | grep -v "Plus\|Pro" | head -1

echo ""
echo "=========================================="

