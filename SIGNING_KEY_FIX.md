# 🔑 Signing Key Mismatch - Fix Guide

## ❌ The Error

Your Android App Bundle is signed with the wrong key. Google Play expects:

**Expected SHA1:**
```
C5:08:13:8E:F6:78:CD:A0:26:C6:49:CA:43:61:74:9A:AA:4F:30:04
```

**Your bundle's SHA1:**
```
D2:4A:7F:17:89:5B:7B:E9:7E:BC:44:45:1B:CF:25:75:4D:DD:52:0B
```

---

## ✅ Solution Steps

### Step 1: Check Your EAS Credentials

```bash
cd ~/Documents/GitHub/thavanai_app
eas credentials
```

**Choose:**
1. Select "Android"
2. Select "Production"
3. View your current credentials

---

### Step 2: Option A - Use Existing Key (Recommended)

If you have the original keystore file:

```bash
# Upload your original keystore to EAS
eas credentials

# Then select:
# - Android
# - Production  
# - Keystore: Set up a new keystore
# - Upload existing keystore
```

**You'll need:**
- Keystore file (.jks or .keystore)
- Keystore password
- Key alias
- Key password

---

### Step 3: Option B - Use Google Play App Signing

If you don't have the original key, use **Google Play App Signing**:

1. **In Google Play Console:**
   - Go to your app
   - Go to "Setup" → "App signing"
   - Check if "Google Play App Signing" is enabled

2. **If NOT enabled:**
   - You'll need to enroll in Google Play App Signing
   - Follow the instructions in Play Console

3. **Download upload certificate:**
   - In Play Console → App Signing
   - Download the "Upload certificate"
   - Note the SHA1 fingerprint

4. **Update EAS with the upload certificate:**
   ```bash
   eas credentials
   # Select Android → Production
   # Upload the certificate from Play Console
   ```

---

### Step 4: Rebuild and Upload

After fixing credentials:

```bash
# Build with production profile
eas build --platform android --profile production

# After build completes, submit
eas submit --platform android --latest
```

---

## 🔍 Verify Your Keystore

To check your current keystore fingerprint:

```bash
# If you have the keystore file
keytool -list -v -keystore your-keystore.jks -alias your-alias
```

---

## 📋 Important Notes

1. **Keep Your Keystore Safe:**
   - Back it up to multiple secure locations
   - Never commit it to Git
   - Save all passwords securely

2. **First Time Upload:**
   - If this is your first upload to this Play Console app, you need the ORIGINAL keystore
   - If you lost it, you may need to create a NEW app listing in Play Console

3. **Google Play App Signing:**
   - Highly recommended for new apps
   - Google manages the signing key
   - You upload with an "upload certificate"

---

## 🆘 If You Lost Your Key

**Bad News:** If you lost your original signing key and haven't enrolled in Google Play App Signing:

1. **Option 1:** Create a new app listing in Google Play Console
   - Change package name in `app.json`
   - Generate new signing key
   - Upload as new app

2. **Option 2:** Contact Google Play Support
   - They may help in rare cases
   - Usually only for established apps

---

## 🎯 Prevention for Future

Add this to your `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "credentialsSource": "remote"
      }
    }
  }
}
```

This ensures EAS always uses the credentials stored in their servers.

---

## 📞 Need Help?

Run these commands to get more info:

```bash
# Check current credentials
eas credentials

# Check build configuration
eas build:configure

# View previous builds
eas build:list --platform android
```

---

## ✅ Quick Checklist

- [ ] Run `eas credentials` to check current keystore
- [ ] Verify SHA1 fingerprint matches expected
- [ ] If mismatch, upload correct keystore or enable Google Play App Signing
- [ ] Rebuild: `eas build --platform android --profile production`
- [ ] Submit: `eas submit --platform android --latest`
- [ ] Verify in Play Console

---

**Important:** This issue MUST be fixed before you can update your app. The signing key is how Google verifies it's really you uploading the update!

