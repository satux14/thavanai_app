# iOS Simulator - Working Setup ✅

## Your Setup
- **Mac**: iMac Retina 5K, 27-inch, 2017 ✅ Supported
- **macOS**: 13.7.8 (Ventura) ✅ Compatible
- **Xcode**: 15.1 ✅ Latest
- **iOS Runtime**: iOS 17.2 ✅ Installed
- **Device**: iPhone 15 (FAD82D3D-3CD9-4436-9440-7DF113658E91) ✅ Ready

## How to Run Expo with iOS Simulator

### Method 1: Let Expo Auto-Detect (Recommended)
Since the simulator is already booted, just run:
```bash
cd ~/Documents/GitHub/thavanai_app
npx expo start
```
Then press `i` - it should automatically detect the booted iPhone 15.

### Method 2: Specify Device Explicitly
If auto-detection doesn't work:
```bash
npx expo start --ios --device "FAD82D3D-3CD9-4436-9440-7DF113658E91"
```

### Method 3: Boot Simulator First, Then Run Expo
```bash
# Boot the iPhone 15
xcrun simctl boot FAD82D3D-3CD9-4436-9440-7DF113658E91

# Open Simulator app (optional, for visual confirmation)
open -a Simulator

# Run Expo
npx expo start
# Press 'i' when prompted
```

## Troubleshooting

### If Expo still tries to use old device:
1. Clear Expo cache:
   ```bash
   rm -rf .expo node_modules/.cache
   ```

2. Boot the correct device:
   ```bash
   xcrun simctl boot FAD82D3D-3CD9-4436-9440-7DF113658E91
   ```

3. List available devices:
   ```bash
   xcrun simctl list devices available
   ```

### If device won't boot:
1. Shutdown all simulators:
   ```bash
   xcrun simctl shutdown all
   ```

2. Boot again:
   ```bash
   xcrun simctl boot FAD82D3D-3CD9-4436-9440-7DF113658E91
   ```

## Quick Reference

**Your iPhone 15 Device ID**: `FAD82D3D-3CD9-4436-9440-7DF113658E91`

**iOS Runtime**: iOS 17.2 (com.apple.CoreSimulator.SimRuntime.iOS-17-2)

**Status**: ✅ Ready to use

