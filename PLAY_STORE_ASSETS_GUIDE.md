# Play Store Assets Preparation Guide

## ✅ What You Have Ready

1. **App Icon (512x512)** ✅
   - Location: `play-store-assets/app-icon-512.png`
   - Already created from your `assets/icon.png`
   - Ready to upload!

---

## 📸 What You Need to Create

### 1. Feature Graphic (1024x500) - REQUIRED

**Option A: Use Online Tool (Easiest)**

Go to https://www.canva.com (free account):

1. Click "Create a design" → "Custom size" → 1024 x 500 px
2. Choose a template or start blank
3. Add your app icon (upload `assets/icon.png`)
4. Add text:
   - **Title:** "eThavanai Book" or "தினத்தவணைப் புத்தகம்"
   - **Subtitle:** "Daily Installment Ledger"
   - **Tagline:** "Digital lending made simple"
5. Use colors from your brand:
   - Blue: #2c3e89 (your icon background)
   - Yellow/Gold: #ffc107 (rupee symbol color)
6. Download as PNG
7. Save to `play-store-assets/feature-graphic-1024x500.png`

**Option B: Use Figma** (https://figma.com):
- Same process as Canva
- More professional design tools
- Free account works

**Option C: Quick Template** - I'll create a basic HTML template for you

---

### 2. Phone Screenshots (2-8 required)

**How to Capture:**

#### Method 1: From iOS Simulator (Running now!)

```bash
# Your simulator is already running!
# Just capture screenshots of key screens:

# 1. Take screenshots in simulator:
# - Press Cmd+S in simulator window
# - Screenshots saved to Desktop

# Screens to capture:
1. Login/Register screen
2. Dashboard with books
3. Book creation form
4. Daily entries table
5. Book with signature
6. PDF export screen (optional)
7. Settings/Language toggle (optional)
```

#### Method 2: From Android Build

```bash
# Run on Android emulator:
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile
npx expo run:android

# Then use Android Screenshot tool:
# Click camera icon in emulator toolbar
# Or use: adb exec-out screencap -p > screenshot.png
```

#### Method 3: From Physical Device

**Best option for Play Store!**
1. Install APK on your Android phone
2. Take screenshots using Volume Down + Power button
3. Transfer to computer
4. Resize if needed

---

### 3. Screenshot Requirements

**Dimensions:**
- Aspect ratio: 9:16 (portrait) or 16:9 (landscape)
- Minimum: 320px on shortest side
- Maximum: 3840px on longest side
- Recommended: 1080x1920 (portrait) or 1920x1080 (landscape)
- Format: PNG or JPEG
- Max size: 8MB each

**What to Capture:**
1. **Login Screen** - Show the welcome screen
2. **Dashboard** - Multiple books displayed
3. **Book Details** - Book info page with all fields
4. **Daily Entries** - The main ledger table
5. **Entry with Signature** - Show signature feature
6. **Language Toggle** - Tamil/English switching
7. **PDF Export** - Optional
8. **Share Feature** - Optional

**Tips for Good Screenshots:**
- Use real data (not test data)
- Fill in forms completely
- Show the app in use
- Good lighting (if from phone camera)
- Clean UI (close keyboards, dismiss popups)
- Consistent device frame (optional)

---

## 🎨 Creating the Feature Graphic (Step by Step)

### Using Canva (Recommended):

1. **Go to** https://www.canva.com/create/banners/
2. **Click** "Custom size" → 1024 x 500 pixels
3. **Background:**
   - Choose solid color: #2c3e89 (blue from your icon)
   - Or use gradient: #2c3e89 to #1a237e
4. **Add Icon:**
   - Upload `assets/icon.png`
   - Resize to ~350x350px
   - Position on left side
5. **Add Text (Right side):**
   ```
   eThavanai Book
   (Large, white, bold)
   
   தினத்தவணைப் புத்தகம்
   (Medium, gold #ffc107)
   
   Daily Installment Ledger
   (Medium, light blue #e3f2fd)
   
   Track • Manage • Grow
   (Small, light)
   ```
6. **Add Elements:**
   - Rupee symbol ₹ (large, faded in background)
   - Decorative lines
   - Your branding colors
7. **Download:**
   - File type: PNG
   - Quality: High
   - Save as: `feature-graphic-1024x500.png`

### Example Layout:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [Icon]        eThavanai Book                      │
│  350x350      தினத்தவணைப் புத்தகம்                   │
│                                                    │
│               Daily Installment Ledger             │
│               Track • Manage • Grow                │
│                                                    │
└────────────────────────────────────────────────────┘
     1024 x 500 pixels
```

---

## 🚀 Quick Start (Right Now!)

### Step 1: Capture Screenshots (5 minutes)

Your iOS simulator is already running! Just:

```bash
# 1. Open simulator
# 2. Navigate to each screen
# 3. Press Cmd+S to screenshot
# 4. Find screenshots on Desktop
# 5. Move to play-store-assets/screenshots/

mkdir -p play-store-assets/screenshots
# Move your Desktop screenshots here
```

### Step 2: Create Feature Graphic (10 minutes)

1. Open https://www.canva.com
2. Sign up (free)
3. Create 1024x500 design
4. Follow layout above
5. Download PNG

### Step 3: Organize Files

```bash
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile

# Your structure should look like:
play-store-assets/
├── app-icon-512.png ✅ (already done!)
├── feature-graphic-1024x500.png (create this)
└── screenshots/
    ├── 01-login.png
    ├── 02-dashboard.png
    ├── 03-book-info.png
    ├── 04-daily-entries.png
    └── 05-signature.png
```

---

## 📋 Upload Checklist

### Required (Must Have):
- [x] App Icon 512x512 ✅
- [ ] Feature Graphic 1024x500
- [ ] Phone Screenshots (minimum 2, recommend 4-6)

### Optional (Good to Have):
- [ ] 7-inch Tablet Screenshots
- [ ] 10-inch Tablet Screenshots
- [ ] Promo Video (YouTube link)

### Screenshots to Capture:
- [ ] Login/Register Screen
- [ ] Dashboard with Books
- [ ] Book Creation Form
- [ ] Daily Entries Table
- [ ] Entry with Signature
- [ ] (Optional) Language Toggle
- [ ] (Optional) PDF Export
- [ ] (Optional) Search/Filter

---

## 🎯 Pro Tips

### For Better Screenshots:
1. **Use real data** - Not "Test User" or "Sample Book"
2. **Fill forms completely** - Show a complete, professional use case
3. **Show key features** - Signature, Tamil text, PDF export
4. **Consistent sizing** - All screenshots same dimensions
5. **Add device frames** - Use https://mockuphone.com (optional)

### For Feature Graphic:
1. **Keep it simple** - Don't overcrowd
2. **Use brand colors** - Match your icon
3. **Readable text** - Even at thumbnail size
4. **Show value** - "Track daily payments" not just "App name"
5. **Bilingual** - Tamil + English shows your market

---

## 🔧 Tools & Resources

### Free Design Tools:
- **Canva** - https://www.canva.com (Easiest)
- **Figma** - https://www.figma.com (Professional)
- **GIMP** - https://www.gimp.org (Desktop app)
- **Photopea** - https://www.photopea.com (Online Photoshop)

### Screenshot Tools:
- **iOS Simulator** - Cmd+S
- **Android Emulator** - Camera icon
- **Physical Device** - Volume Down + Power
- **Screenshot Resizer** - https://www.birme.net

### Device Frame Generators:
- **Mockuphone** - https://mockuphone.com
- **Screely** - https://www.screely.com
- **Smartmockups** - https://smartmockups.com

### Asset Validators:
- **Image Resizer** - https://imageresizer.com
- **TinyPNG** - https://tinypng.com (Compress without quality loss)

---

## ⚡ Fastest Path (15 Minutes Total)

1. **Screenshots (5 min):**
   - Simulator → Navigate → Cmd+S
   - Capture 4-5 key screens

2. **Feature Graphic (10 min):**
   - Canva → 1024x500
   - Add icon + text
   - Download

3. **Upload to Play Console:**
   - App icon: `play-store-assets/app-icon-512.png` ✅
   - Feature graphic: Your Canva download
   - Screenshots: Your simulator captures

**Done!** ✅

---

## 🆘 Need Help?

### Common Issues:

**Q: Screenshots too large**
```bash
# Resize with sips:
sips -Z 1920 screenshot.png
```

**Q: Wrong aspect ratio**
```bash
# Check dimensions:
sips -g pixelWidth -g pixelHeight screenshot.png

# Should be 9:16 or 16:9
```

**Q: Feature graphic looks bad**
- Use Canva templates
- Search "App Feature Graphic" in Canva
- Customize with your colors and text

---

## ✅ Current Status

- [x] App Icon 512x512 → `play-store-assets/app-icon-512.png`
- [ ] Feature Graphic 1024x500 → Create in Canva
- [ ] Screenshots → Capture from running simulator

**Next:** Capture screenshots and create feature graphic! 🎨

