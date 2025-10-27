# AdMob Testing Guide - eThavanai Book

## 📱 Download & Install the Build

### Once EAS Build Completes:

1. **Get the Build:**
   ```bash
   # Check build status
   eas build:list
   
   # Download the APK/AAB
   eas build:download --platform android
   ```

2. **Install on Device:**
   - **Method 1:** Use the QR code from EAS build page
   - **Method 2:** Download APK directly from EAS dashboard
   - **Method 3:** Use ADB:
     ```bash
     adb install path/to/your-app.apk
     ```

---

## 🧪 Testing Each Ad Type

### 1. **Banner Ads** (Bottom of screens)

**Where to find:**
- Dashboard screen (bottom)
- Daily Entries screen (bottom)

**How to test:**
1. Open the app
2. Login to your account
3. Go to Dashboard → Banner should appear at bottom
4. Open any book → Daily Entries → Banner at bottom
5. Scroll up/down → Banner stays fixed at bottom

**Expected behavior:**
- ✅ Small banner ad at bottom
- ✅ Doesn't block content
- ✅ Takes 2-5 seconds to load
- ✅ Shows "Ad" label
- ✅ May show test ad with green background (in development)

**Troubleshooting:**
- If no ad appears: Check console logs
- Wait 10 seconds (ads can be slow to load)
- Check internet connection
- Verify AdMob account is active

---

### 2. **Interstitial Ads** (Full-screen)

**When it triggers:**
- After creating your 5th book
- Then after every 5th book (10th, 15th, 20th, etc.)

**How to test:**
1. Login to your account
2. Create books one by one
3. On the **5th book creation** → Full-screen ad should appear
4. Wait for ad or click "X" to close
5. You'll be taken to the daily entries page

**Frequency limits:**
- Minimum 3 minutes between ads
- Maximum 5 ads per day
- Only counts books you create as owner (not shared books)

**Expected behavior:**
- ✅ Full-screen ad covers entire screen
- ✅ Shows countdown (5 seconds) or "X" button
- ✅ Can skip after countdown
- ✅ Navigates to entries after closing

**Troubleshooting:**
- Create 5 books quickly to test
- Check console for "✅ Interstitial ad loaded"
- If skipped: Wait 3+ minutes, create another 5 books
- Check daily limit (max 5/day)

---

### 3. **App Open Ads** (On app launch)

**When it triggers:**
- When you open the app from background
- Maximum once per hour

**How to test:**
1. Open the app fresh (close completely first)
2. Full-screen ad should appear immediately
3. Close ad
4. Go to home screen (minimize app)
5. Wait 1+ hour
6. Open app again → Ad should show again

**Frequency limits:**
- Maximum 1 ad per hour
- Only when app comes to foreground

**Expected behavior:**
- ✅ Shows immediately on app open
- ✅ Quick countdown or "X" button
- ✅ Proceeds to normal app after closing
- ✅ Doesn't interrupt mid-session

**Troubleshooting:**
- Close app completely (swipe away from recent apps)
- Reopen app
- Check console for "✅ App Open ad loaded"
- If not showing: Wait 1 hour since last app open ad

---

## 🎯 Complete Test Checklist

### Initial Setup:
- [ ] Install APK on Android device
- [ ] Open app for first time
- [ ] Create new account OR login
- [ ] Check console logs in Android Studio Logcat (optional)

### Banner Ad Testing:
- [ ] See banner at bottom of Dashboard
- [ ] See banner at bottom of Daily Entries
- [ ] Banner doesn't block content
- [ ] Banner loads within 5 seconds

### Interstitial Ad Testing:
- [ ] Create 5 books (one by one)
- [ ] Full-screen ad appears after 5th book
- [ ] Ad can be closed
- [ ] Navigates to entries page after ad
- [ ] Try creating 5 more books (test frequency limit)

### App Open Ad Testing:
- [ ] Open app fresh → Ad appears
- [ ] Close app, wait 5 minutes, reopen → No ad (too soon)
- [ ] Close app, wait 1+ hour, reopen → Ad appears again

### Premium User Testing (Optional):
- [ ] In database, set `is_premium = 1` for your user
- [ ] Reopen app
- [ ] No banner ads shown
- [ ] No interstitial ads shown
- [ ] No app open ads shown

---

## 📊 Expected Ad Frequency

| Ad Type | Frequency | Location | Skippable |
|---------|-----------|----------|-----------|
| **Banner** | Always visible | Dashboard, Entries | No (small) |
| **Interstitial** | Every 5th book, 3min min, 5/day max | After book creation | Yes (5s) |
| **App Open** | Once per hour | App launch | Yes (immediate) |

---

## 🔍 Debugging Tips

### Check Logs:
```bash
# View Android logs
adb logcat | grep -i "admob\|ad"
```

**Look for:**
- ✅ "AdMob initialized successfully"
- ✅ "Banner ad loaded"
- ✅ "Interstitial ad loaded"
- ✅ "App Open ad loaded"
- ❌ "Ad failed to load: [error]"

### Common Issues:

**1. No ads showing:**
- Check internet connection
- Wait 10 seconds (first load can be slow)
- Verify AdMob account is active
- Check if app is in test mode (should show test ads)

**2. "Ad failed to load" errors:**
- AdMob may be serving no ads (normal in testing)
- Test ads should always work
- Real ads depend on fill rate
- Try again in a few minutes

**3. Too many ads:**
- Frequency limits are in place
- Max 5 interstitials per day
- Max 1 app open per hour
- Banner is always visible (by design)

**4. Ads not tracking:**
- Check AsyncStorage has write permissions
- Frequency data stored in AsyncStorage
- Clear app data to reset counters

---

## 🎨 Development vs Production Ads

### Development Mode (`__DEV__ = true`):
- Uses **Test Ad Units**
- Shows ads with green background and "Test Ad" label
- Always available (100% fill rate)
- No revenue generated
- IDs: `ca-app-pub-3940256099942544/...`

### Production Mode (Release Build):
- Uses **Real Ad Units**
- Shows actual advertiser ads
- Fill rate varies (may not always have ads)
- Generates revenue
- IDs: `ca-app-pub-2582947091237108/...`

---

## 💰 Testing Revenue (Optional)

### AdMob Dashboard:
1. Go to https://apps.admob.google.com/
2. Click on your app: "eThavanai Book - Daily Ledger"
3. View metrics:
   - Impressions
   - Clicks
   - eCPM (earnings per 1000 impressions)
   - Revenue (in test mode: $0)

### Note:
- Test ads generate **NO revenue**
- Real ads generate revenue only in production
- Revenue appears in AdMob dashboard within 24 hours

---

## 📝 Test Ad Unit IDs (Reference)

These are already configured in the app:

```javascript
// Test IDs (Development)
Banner:       ca-app-pub-3940256099942544/6300978111
Interstitial: ca-app-pub-3940256099942544/1033173712
App Open:     ca-app-pub-3940256099942544/3419835294

// Real IDs (Production - your actual units)
Banner:       ca-app-pub-2582947091237108/2175188493
Interstitial: ca-app-pub-2582947091237108/4309670898
App Open:     ca-app-pub-2582947091237108/9992957005
```

---

## ✅ Success Criteria

### Ads are working correctly if:
1. ✅ Banner ads appear at bottom of Dashboard and Entries
2. ✅ Full-screen ad appears after creating 5th book
3. ✅ App open ad appears on fresh app launch
4. ✅ All ads can be closed/skipped
5. ✅ Frequency limits are respected
6. ✅ App doesn't crash when ads load
7. ✅ Premium users see no ads (if implemented)

---

## 🚀 Quick Test Scenario (5 minutes)

1. **Install app** → Open
2. **Login** → Go to Dashboard
3. **Check banner** at bottom (wait 5s)
4. **Create 5 books** quickly
5. **Full-screen ad** should appear after 5th
6. **Close ad** → Open any book
7. **Check banner** at bottom of entries
8. **Close app completely**
9. **Reopen app** → App open ad should show
10. ✅ **All 3 ad types tested!**

---

## 📞 Support

If ads still not working after following this guide:
1. Check AdMob account is active
2. Verify app is approved in AdMob console
3. Wait 24 hours after first AdMob setup
4. Check Android logs for specific errors
5. Ensure internet connection is stable

**App Status Check:**
```bash
# Check if AdMob module is loaded
adb logcat | grep "AdMob initialized"
```

---

## 🎯 Next Steps After Testing

Once ads are confirmed working:
1. Test with multiple users
2. Monitor AdMob dashboard for impressions
3. Implement Premium subscription (to remove ads)
4. Add analytics tracking for ad performance
5. Optimize ad placements based on user feedback

---

**Happy Testing!** 🎉

