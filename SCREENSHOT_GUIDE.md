# Play Store Screenshots Guide

Complete guide to capture professional screenshots for Google Play Store listing.

---

## 📐 **Requirements**

**Minimum:** 2 screenshots  
**Maximum:** 8 screenshots  
**Recommended:** 5-8 screenshots

**Dimensions:**
- Minimum: 320px shortest side
- Maximum: 3840px longest side
- Recommended aspect ratio: 16:9 or 9:16
- Format: PNG or JPEG (PNG recommended)
- File size: Max 8MB per image

---

## 📱 **8 Essential Screenshots to Capture**

### **1. Dashboard - Owner Books (Main Screen)**
**Purpose:** First impression of the app  
**Show:**
- Multiple books with different backgrounds
- Book cards with loan amount, balance, DL No
- Owner/Borrower toggle visible
- Search icon
- Professional, organized layout

**Caption:**  
"Manage Multiple Loan Books Easily - Track all your lending business in one place"

---

### **2. Create/Edit Book Form**
**Purpose:** Show how easy it is to create a book  
**Show:**
- Book creation form with all fields
- Tamil language visible (show "புத்தகம்")
- Date pickers for start/end date
- Background image selection
- Clean, intuitive interface

**Caption:**  
"Create Custom Books with Borrower Details - Add photos and choose colors"

---

### **3. Daily Entries Table**
**Purpose:** Main feature - daily tracking  
**Show:**
- Full table with multiple entries
- Serial number, Date, Credit, Balance, Signature columns
- Some entries filled, some empty
- Book info at top (name, loan amount, balance)
- Add New Page button visible

**Caption:**  
"Track Daily Installments with Auto-Balance Calculation - Never lose track of payments"

---

### **4. Entry Edit Modal**
**Purpose:** Show entry management  
**Show:**
- Entry edit dialog open
- Date picker visible
- Credit amount field
- Auto-calculated balance
- Signature status
- Save and close buttons

**Caption:**  
"Quick Entry Updates with Smart Balance Auto-Fill - Edit any entry with one tap"

---

### **5. Digital Signature Feature**
**Purpose:** Unique selling point  
**Show:**
- Entry with "Sign Here" or "Req. by [user]" button
- Signature status visible in table
- Professional approval workflow

**Caption:**  
"Digital Signature System for Verified Payments - Owner and borrower approval workflow"

---

### **6. PDF Export**
**Purpose:** Professional reporting  
**Show:**
- PDF export dialog or preview
- Professional table format
- Complete book information
- Share options

**Caption:**  
"Export Professional PDF Reports Anytime - Share via WhatsApp, Email, or Print"

---

### **7. Tamil Language Interface**
**Purpose:** Bilingual support (USP)  
**Show:**
- Same screen as Screenshot #3 but in Tamil
- "தினத்தவணைப் புத்தகம்" header visible
- Tamil text throughout
- Language toggle shown

**Caption:**  
"Full Tamil Language Support - தமிழில் முழு ஆதரவு - Perfect for Tamil Nadu users"

---

### **8. Book Sharing & Dashboard Filter**
**Purpose:** Collaboration features  
**Show:**
- Dashboard with search bar visible
- Filter options (Active/Closed/Pending Approval)
- Borrower books section (if available)
- Or: Share book dialog with username field

**Caption:**  
"Share Books & Collaborate with Borrowers - Secure multi-user access control"

---

## 🎨 **How to Capture Screenshots**

### **Method 1: From Android Device**

```bash
# 1. Run the app
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile
npx expo start

# 2. Open on Android device (scan QR code)

# 3. Take screenshots:
# - Power + Volume Down (most Android devices)
# - Screenshots save to device Photos/Screenshots

# 4. Transfer to computer:
adb pull /sdcard/DCIM/Screenshots ./assets-playstore/screenshots/
```

### **Method 2: From Android Emulator**

```bash
# 1. Start Android Studio emulator
# 2. Run app in emulator
# 3. Click camera icon in emulator toolbar
# 4. Screenshots save to: ~/Screenshots/
```

### **Method 3: From Expo Go (iOS/Android)**

```bash
# Use your phone's screenshot feature
# Then transfer via:
# - AirDrop (iOS)
# - Google Photos
# - USB cable
# - Email to yourself
```

---

## ✨ **Enhance Your Screenshots**

### **Option 1: Add Device Frame** (Recommended)

Use **AppLaunchpad** or similar tools:
1. Go to: https://theapplaunchpad.com/mockup-generator/
2. Upload your screenshots
3. Select Android device frame
4. Download enhanced images

### **Option 2: Add Text Overlays** (Optional)

Use **Canva** or **Figma**:
1. Upload screenshot
2. Add text caption overlay at bottom
3. Use brand colors (green/purple/orange from icon)
4. Add feature highlights with icons

### **Option 3: Use Screenshot Tools**

**Screenshots.pro** (recommended):
- Upload screenshots
- Auto-add device frames
- Add captions
- Batch process all images

---

## 📏 **Screenshot Checklist**

Before uploading to Play Store:

- [ ] All 8 screenshots captured
- [ ] Screenshots are clear and high resolution
- [ ] No sensitive personal data visible
- [ ] UI looks polished (no errors, no debug info)
- [ ] Different screens/features shown (not repetitive)
- [ ] Text is readable (not too small)
- [ ] Screenshots match current app version
- [ ] File names are organized (01-dashboard.png, 02-create-book.png, etc.)
- [ ] All screenshots saved to: `./assets-playstore/screenshots/`
- [ ] Aspect ratio is consistent across all images
- [ ] Screenshots showcase best features first

---

## 🎯 **Screenshot Order for Play Store**

**Recommended order** (most impactful first):

1. **Dashboard** - First impression
2. **Daily Entries Table** - Main feature
3. **Digital Signature** - Unique feature
4. **Tamil Language** - USP for target market
5. **Create Book** - Ease of use
6. **Entry Edit** - Functionality
7. **PDF Export** - Professional feature
8. **Book Sharing** - Collaboration

---

## 💡 **Pro Tips**

### **Preparation:**
1. Create sample data with realistic names/amounts
2. Use at least 3-4 different books
3. Fill some entries, leave some empty (shows flexibility)
4. Use different background images
5. Enable Tamil for bilingual screenshots

### **Data to Use:**
```javascript
// Sample data that looks professional:
Book 1:
- Name: "Kumar"
- DL No: "TN/123/2025"
- Amount: ₹10,000
- Background: Nature theme

Book 2:
- Name: "Priya"
- DL No: "TN/456/2025"
- Amount: ₹25,000
- Background: Professional color

Book 3:
- Name: "Raj"
- DL No: "TN/789/2025"
- Amount: ₹50,000
- Background: Custom image
```

### **Avoid:**
- Real personal data
- Too much empty space
- Cluttered UI
- Low contrast
- Pixelated images
- Debug overlays
- Development warnings

---

## 📂 **File Naming Convention**

Save screenshots as:
```
01-dashboard-owner-books.png
02-create-book-form.png
03-daily-entries-table.png
04-entry-edit-modal.png
05-digital-signature.png
06-pdf-export.png
07-tamil-interface.png
08-book-sharing-filter.png
```

---

## 🚀 **Quick Capture Script**

```bash
#!/bin/bash
# Quick screenshot capture helper

echo "📱 Screenshot Capture Guide"
echo ""
echo "1. Open app on device"
echo "2. Navigate to each screen below:"
echo ""
echo "   □ Dashboard with multiple books"
echo "   □ Create/Edit book form"
echo "   □ Daily entries table"
echo "   □ Entry edit dialog"
echo "   □ Digital signature"
echo "   □ PDF export/share"
echo "   □ Tamil language view"
echo "   □ Search/filter/sharing"
echo ""
echo "3. Take screenshot (Power + Vol Down)"
echo "4. Transfer to: ./assets-playstore/screenshots/"
echo ""
echo "Need help? See: SCREENSHOT_GUIDE.md"
```

---

## 📞 **Need Help?**

**Can't capture good screenshots?**
- Run app in emulator with high DPI
- Use screenshot enhancement tools
- Consider hiring designer on Fiverr ($5-20)
- Ask in Expo Discord community

**Tools:**
- Device frames: https://theapplaunchpad.com
- Enhancement: https://screenshots.pro
- Mockups: https://mockuphone.com
- Design: https://canva.com

---

**Ready to capture?** Open your app and start taking screenshots! 📸

---

**Created:** October 26, 2025  
**For:** eThavanai Book v1.0.0

