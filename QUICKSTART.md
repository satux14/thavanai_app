# 🚀 Quick Start Guide

## Get Running in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile
npm install
```

### 2️⃣ Start the App

**For Web (Easiest):**
```bash
npm run web
```
Opens in browser at: http://localhost:8081

**For Android:**
```bash
npm run android
```
(Requires Android emulator or device)

**For iOS (macOS only):**
```bash
npm run ios
```
(Requires Xcode and iOS simulator)

### 3️⃣ Use the App

1. **Fill Book Info** - Enter loan details on first page
2. **Save & Continue** - Navigate to entries table
3. **Add Entry** - Click + button to add daily entry
4. **Capture Signature** - Draw signature with mouse/touch
5. **Save** - Data persists locally

---

## 📱 App Features

### Page 1: Book Information
- D.L. Number
- Name (பெயர்)
- Occupation (தொழில்)
- Address (முகவரி)
- Loan Amount (கடன் தொகை)
- Start & End Dates

### Page 2: Daily Entries Table
| Column | Description |
|--------|-------------|
| வ.எண் | Serial Number |
| தேதி | Date |
| வரவு ரூபாய் | Credit Amount |
| பாக்கி ரூபாய் | Balance Amount |
| கையொப்பம் | Signature |

---

## ⚡ Platform Commands

```bash
# Web Browser
npm run web

# Android Phone/Emulator
npm run android

# iOS Simulator (macOS)
npm run ios

# Start Dev Server
npm start
```

---

## 🎯 First Time Setup

**Web** - Just run `npm run web`

**Android:**
1. Install Android Studio
2. Start emulator OR connect device
3. Run `npm run android`

**iOS (Mac only):**
1. Install Xcode
2. Run `npm run ios`

---

## 🔥 Hot Tips

- ✅ **Data is saved locally** - Survives app restarts
- ✅ **Works offline** - No internet needed
- ✅ **Touch friendly** - Use on tablets/phones
- ✅ **Bilingual** - Tamil & English labels

---

## 🆘 Quick Fixes

**Metro Bundler Error?**
```bash
npm start -- --reset-cache
```

**Build Failed?**
```bash
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && pod install && cd ..
```

**Port Already in Use?**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

---

**Need detailed docs?** See `README.md`

**Ready to go!** 🎉

