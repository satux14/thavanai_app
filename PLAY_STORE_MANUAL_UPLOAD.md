# Manual Play Store Upload Guide

## 🚀 Quick Manual Upload (Recommended for First Time)

Since you don't have a service account set up, manual upload is faster and easier.

---

## 📦 Step 1: Download Your Build

```bash
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile

# Download the AAB file from EAS
eas build:download --platform android --id c2ce93d0-602e-478d-aa9b-c6e4caf2a22a
```

**Or** download from the EAS dashboard:
1. Go to https://expo.dev/
2. Click on your project
3. Go to "Builds"
4. Find build `c2ce93d0-602e-478d-aa9b-c6e4caf2a22a`
5. Click "Download" → Save the `.aab` file

---

## 🎯 Step 2: Upload to Play Console

### Go to Play Console:
1. Open https://play.google.com/console/
2. Select your app: **"eThavanai Book - Daily Ledger"**
3. Go to **"Production"** (left sidebar)
4. Click **"Create new release"**

### Upload the AAB:
1. Click **"Upload"** button
2. Select the downloaded `.aab` file
3. Wait for upload to complete (2-5 minutes)
4. Play Console will automatically:
   - Extract app info
   - Show version code and name
   - List supported devices
   - Check for issues

### Fill in Release Notes:

**English:**
```
🎉 First Release - v1.0.0

✨ Features:
• Complete daily installment tracking system
• Digital ledger for money lending businesses
• Tamil & English language support
• Owner and borrower book sharing
• Digital signature system for entries
• Export books to PDF
• Beautiful book backgrounds with custom colors
• Offline-first with cloud sync
• Dashboard with filtering and search
• Book status management (active/closed)

📱 AdMob Integration:
• Banner ads on Dashboard and Entries
• Interstitial ads (every 5 books)
• App open ads (hourly)
• Premium option (coming soon)

🔒 Security & Privacy:
• Secure authentication
• End-to-end data encryption
• Privacy-first design
• GDPR compliant

Perfect for daily installment businesses, money lenders, and small financial services.
```

**Tamil:**
```
🎉 முதல் வெளியீடு - v1.0.0

✨ அம்சங்கள்:
• முழுமையான தினசரி தவணை கண்காணிப்பு அமைப்பு
• பண கடன் வணிகங்களுக்கான டிஜிட்டல் லெட்ஜர்
• தமிழ் மற்றும் ஆங்கில மொழி ஆதரவு
• உரிமையாளர் மற்றும் கடன் வாங்குபவர் புத்தக பகிர்வு
• உள்ளீடுகளுக்கான டிஜிட்டல் கையொப்ப அமைப்பு
• புத்தகங்களை PDF ஆக ஏற்றுமதி செய்யவும்
• தனிப்பயன் நிறங்களுடன் அழகான புத்தக பின்னணிகள்
• கிளவுட் ஒத்திசைவுடன் ஆஃப்லைன்-முதல்
• வடிகட்டுதல் மற்றும் தேடல் கொண்ட டாஷ்போர்டு
• புத்தக நிலை மேலாண்மை (செயல்படும்/மூடப்பட்டது)

தினசரி தவணை வணிகங்கள், பண கடன் வழங்குபவர்கள் மற்றும் சிறிய நிதி சேவைகளுக்கு ஏற்றது.
```

### Review & Rollout:
1. **Review the release summary** - Check version, supported devices
2. **Save** → Click **"Review release"**
3. **Start rollout to Production** (or Beta testing first)
4. **Confirm** the rollout

---

## ⏰ Timeline

| Stage | Time |
|-------|------|
| Upload AAB | 2-5 minutes |
| Google processing | 1-2 hours |
| Review by Google | 1-7 days (typically 1-3 days) |
| Published | Live on Play Store |

---

## 📋 Pre-Upload Checklist

Before uploading, ensure you've completed:

### Store Listing:
- [x] App name
- [x] Short description
- [x] Full description
- [x] App icon (512x512)
- [x] Feature graphic (1024x500)
- [x] Screenshots (at least 2)
- [ ] Privacy Policy URL
- [ ] Contact email

### Content Rating:
- [ ] Complete questionnaire
- [ ] Get rating certificate

### App Category:
- [ ] Select: "Business" or "Finance"
- [ ] Add tags (optional)

### Pricing & Distribution:
- [x] Free app
- [x] Countries: All (or select specific)
- [x] Content rating: Everyone/PEGI 3

---

## 🔧 Common Issues & Solutions

### Issue 1: "App not approved for production"
**Solution:** Start with **Internal Testing** first:
1. Go to "Internal testing" (left sidebar)
2. Create new release there
3. Add testers (your email)
4. Test for a few days
5. Then promote to Production

---

### Issue 2: "Duplicate version code"
**Solution:** Build a new version:
```bash
# Update version in app.json
# Then rebuild
eas build --platform android --profile production
```

---

### Issue 3: "Privacy Policy URL required"
**Solution:** Use your hosted privacy policy:
```
https://tapi.thesrsconsulting.in/privacy
```

---

### Issue 4: "Content rating required"
**Solution:**
1. Go to "Store presence" → "Content rating"
2. Click "Start questionnaire"
3. Fill out the IARC questionnaire
4. Submit for rating

---

## 🎯 Recommended First Upload Process

### For First Time:

1. **Internal Testing First** (Recommended):
   ```
   Upload to: Internal Testing
   Testers: Your email + 1-2 friends
   Duration: 3-7 days
   Purpose: Catch bugs, test on real devices
   ```

2. **Then Closed Beta** (Optional):
   ```
   Upload to: Closed Testing
   Testers: 10-50 users (via email list)
   Duration: 1-2 weeks
   Purpose: Get feedback, test at scale
   ```

3. **Finally Production**:
   ```
   Upload to: Production
   Rollout: Staged (10% → 50% → 100%)
   Monitor: Crash reports, reviews
   ```

---

## 📱 After Upload

### Monitor Your Release:

1. **Check Dashboard** (1-2 hours after upload):
   - Processing status
   - Any warnings or errors
   - Supported devices count

2. **Review Status** (1-7 days):
   - "Pending publication" → Being reviewed
   - "Approved" → Will go live soon
   - "Changes requested" → Fix issues and resubmit

3. **Published**:
   - App is live on Play Store
   - Check the store listing
   - Test download and install
   - Monitor crash reports

---

## 🚨 If Manual Upload Seems Difficult

### Alternative: Use Service Account (For Future)

**Only do this after first manual upload succeeds!**

See **ANDROID_PLAY_STORE_GUIDE.md** section "Setting Up Service Account" for:
- Creating service account in Google Cloud
- Downloading JSON key
- Granting permissions in Play Console
- Using `eas submit` with automation

---

## ✅ Quick Summary

```bash
# 1. Download build
eas build:download --platform android --id c2ce93d0-602e-478d-aa9b-c6e4caf2a22a

# 2. Go to Play Console
# https://play.google.com/console/

# 3. Production → Create new release

# 4. Upload the .aab file

# 5. Add release notes (copy from above)

# 6. Review and rollout

# 7. Wait for Google review (1-7 days)

# 8. App goes live! 🎉
```

---

**Current Build ID:** `c2ce93d0-602e-478d-aa9b-c6e4caf2a22a`

**Download and upload manually - it's easier for your first time!** 🚀

