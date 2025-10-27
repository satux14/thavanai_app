# iOS Development & Testing Guide

## 🍎 Why iOS Stopped Working After AdMob

### The Issue:
After adding AdMob (a **native module**), the iOS app needs to be **rebuilt** because:
1. AdMob SDK needs to be installed via CocoaPods
2. Native code (Objective-C/Swift) needs to be compiled
3. The development build is no longer compatible

### Before AdMob:
- `npx expo start` → Scan QR → App worked ✅

### After AdMob:
- Native modules changed
- Old development build is outdated ❌
- Need to rebuild native iOS app ✅

---

## 🚀 Solution: Rebuild iOS App

### Method 1: Build & Run on Simulator (Recommended)

```bash
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile

# This will:
# 1. Install CocoaPods dependencies
# 2. Build the iOS app with Xcode
# 3. Launch iOS simulator
# 4. Install and run the app
npx expo run:ios
```

**First time:** This will take 5-10 minutes (compiling native code)
**Subsequent runs:** 1-2 minutes (incremental build)

---

### Method 2: Build & Run on Physical Device

```bash
# Run on connected iPhone/iPad
npx expo run:ios --device
```

**Requirements:**
- Mac computer
- Xcode installed
- iPhone connected via USB
- Apple Developer account (free tier works)

---

### Method 3: Use EAS Build (Cloud Build)

```bash
# Build development client on EAS
eas build --platform ios --profile development

# Install on your device, then:
npx expo start --dev-client
```

**Advantage:** No local Xcode needed
**Disadvantage:** Slower (cloud build takes time)

---

## 🔧 Common Issues & Solutions

### Issue 1: "Command not found: xcodebuild"

**Problem:** Xcode not installed or not in PATH

**Solution:**
```bash
# Install Xcode from App Store
# Then install command line tools:
sudo xcode-select --install

# Verify installation:
xcodebuild -version
```

---

### Issue 2: "No development build installed"

**Problem:** Old development build is incompatible

**Solution:**
```bash
# Delete old app from simulator
# Then rebuild:
npx expo run:ios
```

**Or manually:**
1. Open Simulator
2. Long-press app icon → Delete
3. Run `npx expo run:ios` again

---

### Issue 3: "CocoaPods could not find compatible versions"

**Problem:** Pod dependency conflicts

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
npx expo run:ios
```

---

### Issue 4: Build fails with AdMob errors

**Problem:** AdMob configuration issues

**Solution:**
```bash
# Clean everything and rebuild
cd ios
xcodebuild clean
rm -rf build
cd ..
npx expo run:ios
```

---

### Issue 5: "No simulators available"

**Problem:** No iOS simulators installed

**Solution:**
```bash
# Open Xcode
# Go to: Window → Devices and Simulators
# Click '+' to add a simulator
# Choose iOS version and device type

# Or via command line:
xcrun simctl list devices
```

---

## 📱 Development Workflow

### After Native Module Changes:

1. **First time after adding native modules:**
   ```bash
   npx expo run:ios  # Rebuild required
   ```

2. **JavaScript-only changes:**
   ```bash
   # App is already installed, just reload
   Press 'r' in terminal to reload
   ```

3. **Native code changes (rare):**
   ```bash
   npx expo run:ios  # Rebuild required
   ```

---

## ⚡ Quick Commands Reference

```bash
# Build and run on simulator
npx expo run:ios

# Build and run on specific simulator
npx expo run:ios --simulator="iPhone 15 Pro"

# Build and run on connected device
npx expo run:ios --device

# List available simulators
xcrun simctl list devices

# Open iOS simulator
open -a Simulator

# Clean build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

---

## 🎯 Testing AdMob on iOS Simulator

### Important: Test Ads Only!

**iOS Simulator Limitations:**
- ✅ Can show test ads
- ✅ Can test ad placement and UI
- ❌ Cannot test real ads (policy violation)
- ❌ Cannot click ads (no revenue)

**Test Ad Unit IDs** (already configured):
```
Banner:       ca-app-pub-3940256099942544/2934735716
Interstitial: ca-app-pub-3940256099942544/4411468910
App Open:     ca-app-pub-3940256099942544/5662855259
```

### Testing Steps:

1. **Build and run:**
   ```bash
   npx expo run:ios
   ```

2. **Check console for AdMob initialization:**
   ```
   ✅ AdMob initialized successfully
   ✅ Banner ad loaded
   ✅ Interstitial ad loaded
   ✅ App Open ad loaded
   ```

3. **Test each ad type:**
   - Banner: Go to Dashboard → See banner at bottom
   - Interstitial: Create 5 books → Full-screen ad
   - App Open: Close app → Reopen → Full-screen ad

4. **Verify test ads show:**
   - Green background with "Test Ad" label
   - If real ad unit IDs showing: Check `__DEV__` flag

---

## 🍎 iOS-Specific AdMob Notes

### App Tracking Transparency (ATT):

iOS requires permission to track users for ads. AdMob library handles this automatically, but you can customize:

**In Info.plist (already configured):**
```xml
<key>NSUserTrackingUsageDescription</key>
<string>We use tracking to show you relevant ads</string>
```

### SKAdNetwork:

For iOS 14.5+, Apple requires SKAdNetwork identifiers. These are already included via the AdMob SDK.

---

## 📊 Development vs Production

### Development Mode (`__DEV__ = true`):
- Uses test ad unit IDs
- Shows test ads (green background)
- Safe for testing
- No AdMob policy violations

### Production Mode (TestFlight/App Store):
- Uses real ad unit IDs
- Shows real ads
- Generates revenue
- Must follow AdMob policies

---

## 🔄 Switching Between Platforms

### After working on iOS, switch to Android:
```bash
npx expo run:android
```

### After working on Android, switch to iOS:
```bash
npx expo run:ios
```

### Web (no rebuild needed):
```bash
npx expo start --web
```

---

## 💡 Pro Tips

1. **Keep simulator running:** Faster rebuilds
2. **Use Xcode for debugging:** Better error messages
3. **Check iOS logs:** More detailed than terminal
4. **Clean build if issues:** Solves 90% of problems
5. **Update CocoaPods:** `sudo gem install cocoapods`

---

## 🆘 Still Having Issues?

### Check Prerequisites:
```bash
# Node version (should be 18+)
node --version

# NPM version
npm --version

# Xcode version (should be 14+)
xcodebuild -version

# CocoaPods version
pod --version

# Expo CLI version
npx expo --version
```

### Common Prerequisites Issues:

**Node too old:**
```bash
# Update Node.js
brew upgrade node
```

**Xcode too old:**
```bash
# Update Xcode from App Store
# Then update command line tools:
sudo xcode-select --install
```

**CocoaPods too old:**
```bash
# Update CocoaPods
sudo gem install cocoapods
```

---

## ✅ Success Criteria

iOS development is working when:
1. ✅ `npx expo run:ios` builds successfully
2. ✅ Simulator launches automatically
3. ✅ App installs and opens
4. ✅ AdMob logs appear in console
5. ✅ Test ads show in the app
6. ✅ Hot reload works (press 'r' to reload)

---

## 🎓 Summary

### Before AdMob (Managed Workflow):
```bash
npx expo start  # Just works ✅
```

### After AdMob (Bare Workflow with Native Modules):
```bash
# iOS: Need to build native code
npx expo run:ios

# Android: Need to build native code  
npx expo run:android

# Web: No build needed
npx expo start --web
```

**Key Takeaway:** Native modules = native builds required

---

**Current Status:** `npx expo run:ios` is running in the background.
This will take 5-10 minutes for the first build. ⏱️

**Next:** Once build completes, simulator will open automatically! 🎉

