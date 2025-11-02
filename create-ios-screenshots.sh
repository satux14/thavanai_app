#!/bin/bash

# iOS Screenshot Generator
# Resizes Android screenshots to iOS App Store requirements

echo "🎨 Creating iOS Screenshots from Android assets..."

# Create output directories
mkdir -p ios-screenshots/iphone-6.5
mkdir -p ios-screenshots/ipad-13

# Android screenshot directory
ANDROID_DIR="play-store-assets/screenshots"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    echo "Run: brew install imagemagick"
    exit 1
fi

# iPhone 6.5" Screenshots (1284 x 2778 portrait)
echo "📱 Creating iPhone 6.5\" screenshots..."

convert "$ANDROID_DIR/screenshot-main.jpg" -resize 1284x2778 -gravity center -background white -extent 1284x2778 "ios-screenshots/iphone-6.5/01-main.jpg"
convert "$ANDROID_DIR/screenshot_create.jpg" -resize 1284x2778 -gravity center -background white -extent 1284x2778 "ios-screenshots/iphone-6.5/02-create.jpg"
convert "$ANDROID_DIR/screenshot_daily.jpg" -resize 1284x2778 -gravity center -background white -extent 1284x2778 "ios-screenshots/iphone-6.5/03-daily.jpg"

# iPad 13" Screenshots (2064 x 2752 portrait)
echo "📱 Creating iPad 13\" screenshots..."

convert "$ANDROID_DIR/screenshot-main.jpg" -resize 2064x2752 -gravity center -background white -extent 2064x2752 "ios-screenshots/ipad-13/01-main.jpg"
convert "$ANDROID_DIR/screenshot_create.jpg" -resize 2064x2752 -gravity center -background white -extent 2064x2752 "ios-screenshots/ipad-13/02-create.jpg"
convert "$ANDROID_DIR/screenshot_daily.jpg" -resize 2064x2752 -gravity center -background white -extent 2064x2752 "ios-screenshots/ipad-13/03-daily.jpg"

echo ""
echo "✅ iOS Screenshots created!"
echo ""
echo "📁 iPhone 6.5\" screenshots: ios-screenshots/iphone-6.5/"
echo "📁 iPad 13\" screenshots: ios-screenshots/ipad-13/"
echo ""
echo "🚀 Next steps:"
echo "1. Review the screenshots"
echo "2. Upload to App Store Connect"
echo "3. Go to your app → App Store → iPhone 6.5\" Display → Screenshots"
echo "4. Go to your app → App Store → iPad 13\" Display → Screenshots"


