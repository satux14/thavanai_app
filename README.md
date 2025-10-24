# தினத்தவணைப் புத்தகம் (Thavanai Mobile App)
## Daily Installment Book - React Native App

A cross-platform mobile and web application for tracking daily installment loans. Works on **Web, Android, and iOS**.

## 📱 Features

### Page 1: Book Information
- **D.L.No.** - Loan document number
- **பெயர் (Name)** - Customer name
- **தொழில் (Occupation)** - Customer occupation
- **முகவரி (Address)** - Customer address
- **கடன் தொகை ரூ (Loan Amount)** - Total loan amount
- **ஆரம்ப தேதி (Start Date)** - Loan start date
- **முடிவு தேதி (End Date)** - Loan end date

### Page 2+: Daily Entries Table
5-column table with:
1. **வ.எண் (Serial No.)** - Entry serial number
2. **தேதி (Date)** - Payment date
3. **வரவு ரூபாய் (Credit Amount)** - Amount received
4. **பாக்கி ரூபாய் (Balance Amount)** - Remaining balance
5. **கையொப்பம் (Signature)** - Digital signature

### Key Features
- ✅ Cross-platform (Web, Android, iOS)
- ✅ Digital signature capture
- ✅ Local data storage (AsyncStorage)
- ✅ Tamil & English bilingual
- ✅ Touch-friendly interface
- ✅ Offline-first architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- For iOS: macOS with Xcode
- For Android: Android Studio

### Installation

```bash
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile

# Install dependencies
npm install
```

## 📲 Running the App

### Run on Web Browser
```bash
npm run web
```
Then open: http://localhost:8081

### Run on Android
```bash
# Start Metro bundler
npm start

# In another terminal
npm run android
```

**Prerequisites for Android:**
- Android Studio installed
- Android emulator running OR Android device connected via USB with USB debugging enabled

### Run on iOS (macOS only)
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
```

**Prerequisites for iOS:**
- macOS with Xcode installed
- iOS simulator setup

## 📦 Project Structure

```
thavanai_mobile/
├── App.js                      # Main app with navigation setup
├── src/
│   ├── screens/
│   │   ├── BookInfoScreen.js   # Page 1: Book information form
│   │   ├── EntriesScreen.js    # Page 2: Table of entries
│   │   └── AddEntryScreen.js   # Add/Edit entry form
│   └── utils/
│       └── storage.js          # AsyncStorage utilities
├── package.json
└── README.md
```

## 🎨 Screens

### 1. Book Info Screen
- Form to capture loan book details
- Blue and pink color scheme matching original document
- Tamil text with English translations
- Save and continue to entries

### 2. Entries Screen
- Scrollable table with 10 rows by default
- 5 columns as per original document
- Tap any row to edit
- Add new entries
- Navigate back to book info

### 3. Add/Edit Entry Screen
- Form to add or modify entries
- Digital signature capture
- Date and amount inputs
- Save or cancel options

## 💾 Data Storage

- Uses AsyncStorage for local data persistence
- Data persists across app restarts
- No server required (offline-first)
- Separate storage for:
  - Book information
  - Daily entries

## 🎯 Usage Flow

1. **First Launch**
   - Opens Book Info screen
   - Fill in customer and loan details
   - Click "Save & Continue"

2. **View Entries**
   - See table with 10 empty rows
   - Click "Add Entry" button
   - Fill in entry details
   - Capture signature
   - Save entry

3. **Edit Entry**
   - Tap any row in the table
   - Modify details
   - Update signature if needed
   - Save changes

4. **Navigate**
   - "View Entries" from Book Info
   - "Book Info" from Entries page

## 🛠️ Development

### Install Additional Packages
```bash
npm install @react-navigation/native @react-navigation/stack \
  react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage \
  react-native-signature-canvas
```

### Start Development Server
```bash
npm start
```

Then press:
- `w` - Run on web
- `a` - Run on Android
- `i` - Run on iOS

### Build for Production

#### Web
```bash
npm run build:web
# Output in: build/
```

#### Android APK
```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS (macOS only)
```bash
# Open in Xcode
open ios/thavanaimobile.xcworkspace

# Archive and export from Xcode
```

## 🎨 Color Scheme

Matching the original document:
- **Primary Blue**: `#2196F3`
- **Pink/Red**: `#e91e63`
- **Success Green**: `#4CAF50`
- **Background**: `#f5f5f5`
- **White**: `#fff`

## 📱 Platform-Specific Notes

### Web
- Fully functional in modern browsers
- Responsive design
- Signature capture using HTML5 Canvas
- Works offline after first load

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 33
- Signature capture works with touch
- Back button navigation supported

### iOS
- Minimum iOS: 13.0
- Signature capture works with touch
- Native iOS navigation gestures

## 🔧 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache
```

### Android Build Fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Fails
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Signature Not Saving
- Make sure you're on latest version of react-native-signature-canvas
- Check platform-specific permissions if needed

## 📄 License

This project is for personal/commercial use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Ensure you're using compatible Node.js version (16+)

## 📱 Screenshots

### Page 1: Book Information
- Tamil title: தினத்தவணைப் புத்தகம்
- Blue header with D.L.No field
- Form fields with Tamil labels
- Pink underlines for inputs

### Page 2: Entries Table
- 5-column table layout
- Blue header with Tamil/English text
- Pink borders
- Scrollable rows
- Signature indicator (✓)

## 🚀 Next Steps After Installation

1. Run `npm run web` to test on browser first
2. Try adding book information
3. Navigate to entries page
4. Add a test entry with signature
5. Verify data persists on app restart

## 📞 Quick Commands Reference

```bash
# Start development
npm start

# Run on web
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios

# Clear cache
npm start -- --reset-cache

# Install dependencies
npm install
```

---

**Built with React Native + Expo**  
**Version**: 1.0.0  
**Last Updated**: October 2025

