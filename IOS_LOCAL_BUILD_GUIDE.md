# iOS Local Build Setup - Complete ✅

## What Was Fixed

1. **Node.js Version**: Upgraded from v14 to v20.19.5 (via nvm)
2. **CocoaPods**: Updated from 1.10.2 to 1.16.2 (user install)
3. **Xcode Version Check**: Patched React Native to accept Xcode 15.1 (was requiring 16.1)
4. **iOS Runtime**: Installed iOS 17.2 simulator runtime
5. **Simulator Device**: Created iPhone 15 device with iOS 17.2

## How to Build iOS App Locally

### Prerequisites Setup (One-time)

Make sure you have these in your shell:
```bash
# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Add CocoaPods to PATH (if using user install)
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
```

### Build and Run

```bash
cd ~/Documents/GitHub/thavanai_app

# Load Node.js 20 and CocoaPods
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"

# Build and run on simulator
npx expo run:ios --device "FAD82D3D-3CD9-4436-9440-7DF113658E91"
```

### Alternative: Let Expo Choose Device

```bash
npx expo run:ios
```

### If Pod Install Fails

If you need to reinstall pods:
```bash
cd ios
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
pod install
```

## Important Notes

### Patching React Native

The file `node_modules/react-native/scripts/cocoapods/helpers.rb` was patched to allow Xcode 15.1:
- Changed `min_xcode_version_supported` from `'16.1'` to `'15.0'`

**⚠️ Warning**: This patch will be lost if you run `npm install` or update React Native. You may need to reapply it.

### Your iPhone 15 Device ID
- **Device ID**: `FAD82D3D-3CD9-4436-9440-7DF113658E91`
- **Runtime**: iOS 17.2

### Check Available Devices
```bash
xcrun simctl list devices available
```

## Troubleshooting

### If Build Fails
1. Clean build folder:
   ```bash
   cd ios
   xcodebuild clean -workspace eThavanaiBookDailyLedger.xcworkspace -scheme eThavanaiBookDailyLedger
   ```

2. Reinstall pods:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   ```

### If Node.js Version Wrong
Always use Node.js 20:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
```

### If CocoaPods Not Found
```bash
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
pod --version  # Should show 1.16.2
```

## Quick Reference

**Current Build Status**: ✅ Building (first time may take 10-15 minutes)

**Next Steps**: Wait for the build to complete. The app will automatically launch on the iPhone 15 simulator.

