#!/bin/bash

# eThavanai Book - Build and Deploy Script
# This script helps automate the Android build and deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if in correct directory
if [ ! -f "app.json" ]; then
    print_error "Error: app.json not found. Please run this script from the project root."
    exit 1
fi

print_header "eThavanai Book - Android Build & Deploy"

echo "What would you like to do?"
echo ""
echo "1) Build Production AAB (for Play Store)"
echo "2) Build Preview APK (for testing)"
echo "3) Check Build Status"
echo "4) View Project Configuration"
echo "5) Submit to Play Store (interactive)"
echo "6) Prepare Assets (icons, screenshots)"
echo "7) Run Pre-Flight Checklist"
echo "8) Exit"
echo ""

read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        print_header "Building Production AAB"
        print_info "This will create an Android App Bundle for Play Store submission."
        print_info "Build will be done in the cloud (takes 15-20 minutes)."
        echo ""
        
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            print_warning "Build cancelled."
            exit 0
        fi
        
        print_info "Starting build..."
        eas build --platform android --profile production
        
        print_success "Build started successfully!"
        print_info "Download link will be provided when build completes."
        print_info "Save the AAB file to: ./builds/"
        ;;
        
    2)
        print_header "Building Preview APK"
        print_info "This will create an APK for testing on your device."
        echo ""
        
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            print_warning "Build cancelled."
            exit 0
        fi
        
        print_info "Starting build..."
        eas build --platform android --profile preview
        
        print_success "Build started successfully!"
        print_info "Install APK with: adb install path/to/app.apk"
        ;;
        
    3)
        print_header "Build Status"
        print_info "Fetching your recent builds..."
        echo ""
        eas build:list --platform android --limit 5
        ;;
        
    4)
        print_header "Project Configuration"
        
        echo -e "${YELLOW}App Configuration (app.json):${NC}"
        echo "─────────────────────────────────"
        cat app.json | grep -A 5 '"name":\|"version":\|"android":'
        echo ""
        
        echo -e "${YELLOW}EAS Configuration (eas.json):${NC}"
        echo "─────────────────────────────────"
        cat eas.json
        echo ""
        
        echo -e "${YELLOW}Package Info (package.json):${NC}"
        echo "─────────────────────────────────"
        cat package.json | grep -A 3 '"name":\|"version":'
        ;;
        
    5)
        print_header "Play Store Submission Guide"
        print_info "Opening the comprehensive guide..."
        echo ""
        
        if command -v open &> /dev/null; then
            open ANDROID_PLAY_STORE_GUIDE.md
            print_success "Guide opened!"
        else
            print_info "Please open: ANDROID_PLAY_STORE_GUIDE.md"
        fi
        
        print_info "Also visit: https://play.google.com/console"
        ;;
        
    6)
        print_header "Prepare Assets"
        print_info "Asset preparation helper"
        echo ""
        
        echo "Required assets for Play Store:"
        echo ""
        echo "□ App Icon (512×512 PNG)"
        echo "□ Feature Graphic (1024×500 PNG)"
        echo "□ Screenshots (2-8 phone screenshots)"
        echo "□ Privacy Policy URL"
        echo "□ Store listing text (English & Tamil)"
        echo ""
        
        print_info "Icon options available at:"
        echo "  http://tapp.thesrsconsulting.in/icon-colorful.html"
        echo ""
        
        print_info "Store listings available at:"
        echo "  ./store-listings/en-US.md"
        echo "  ./store-listings/ta-IN.md"
        echo ""
        
        print_info "Save all assets to: ./assets-playstore/"
        echo ""
        
        read -p "Open icon options page? (y/n): " open_icons
        if [ "$open_icons" = "y" ]; then
            if command -v open &> /dev/null; then
                open "http://tapp.thesrsconsulting.in/icon-colorful.html"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "http://tapp.thesrsconsulting.in/icon-colorful.html"
            fi
        fi
        ;;
        
    7)
        print_header "Pre-Flight Checklist"
        
        echo "Before submitting to Play Store, verify:"
        echo ""
        
        # Check app.json
        if grep -q '"version"' app.json; then
            VERSION=$(grep '"version"' app.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
            print_success "App version: $VERSION"
        else
            print_error "Version not found in app.json"
        fi
        
        # Check package name
        if grep -q '"package"' app.json; then
            PACKAGE=$(grep '"package"' app.json | sed 's/.*: "\(.*\)".*/\1/')
            print_success "Package name: $PACKAGE"
        else
            print_error "Package name not found in app.json"
        fi
        
        # Check if server is running
        if curl -s "http://tapp.thesrsconsulting.in/health" > /dev/null 2>&1; then
            print_success "Server is running"
        else
            print_warning "Server might be down (check tapp.thesrsconsulting.in)"
        fi
        
        # Check store listings
        if [ -f "store-listings/en-US.md" ]; then
            print_success "English store listing found"
        else
            print_error "English store listing missing"
        fi
        
        if [ -f "store-listings/ta-IN.md" ]; then
            print_success "Tamil store listing found"
        else
            print_warning "Tamil store listing missing (optional)"
        fi
        
        # Check privacy policy
        if [ -f "PRIVACY_POLICY.md" ]; then
            print_success "Privacy policy found"
        else
            print_error "Privacy policy missing"
        fi
        
        # Check terms of service
        if [ -f "TERMS_OF_SERVICE.md" ]; then
            print_success "Terms of service found"
        else
            print_warning "Terms of service missing"
        fi
        
        echo ""
        print_info "Manual checks needed:"
        echo "  □ Test app on real Android device"
        echo "  □ All features working correctly"
        echo "  □ No crashes or major bugs"
        echo "  □ Icon selected and prepared (512×512 PNG)"
        echo "  □ Feature graphic created (1024×500 PNG)"
        echo "  □ Screenshots captured (2-8 images)"
        echo "  □ Privacy policy hosted publicly"
        echo "  □ Google Play Developer account created"
        echo ""
        ;;
        
    8)
        print_info "Goodbye!"
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_header "Next Steps"
print_info "For complete guide, see: ANDROID_PLAY_STORE_GUIDE.md"
print_info "For help: support@thesrsconsulting.in"
echo ""

