# Codebase Analysis - eThavanai Book (Daily Ledger App)

## 📋 Project Overview

**eThavanai Book** is a React Native/Expo application for tracking daily installment loans (தினத்தவணைப் புத்தகம்). It's a client-server application with:
- **Mobile App**: React Native with Expo (iOS, Android, Web)
- **Backend Server**: Node.js/Express with SQLite database
- **Primary Use Case**: Digital ledger for lenders to track loans, payments, and borrower signatures

---

## 🏗️ Architecture Overview

### Client-Server Architecture
- **Client**: React Native app using Expo SDK 54
- **Server**: Express.js REST API with SQLite database
- **Communication**: RESTful API with JWT authentication
- **Offline Support**: AsyncStorage caching with offline-first approach

### Tech Stack
- **Frontend**: React Native 0.81.5, React 19.1.0, Expo SDK 54
- **Navigation**: React Navigation v7 (Stack Navigator)
- **State Management**: React Hooks (useState, useEffect)
- **Backend**: Node.js, Express.js, SQLite3
- **Authentication**: JWT tokens stored in AsyncStorage
- **Storage**: AsyncStorage (client), SQLite (server)
- **Ads**: Google Mobile Ads (AdMob)
- **Internationalization**: Custom i18n system (English/Tamil)

---

## 📁 Project Structure

```
thavanai_app/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── BookInfoScreen.js
│   │   ├── BookDetailScreen.js
│   │   └── EntriesScreen.js
│   ├── components/       # Reusable components
│   │   ├── BannerAd.js
│   │   ├── DatePicker.js
│   │   ├── ErrorBoundary.js
│   │   ├── LanguageToggle.js
│   │   └── OfflineIndicator.js
│   ├── utils/            # Utility functions
│   │   ├── auth.js       # Authentication helpers
│   │   ├── storage.js    # Data storage (API wrapper)
│   │   ├── database.js   # Legacy AsyncStorage DB (deprecated)
│   │   ├── i18n.js       # Internationalization
│   │   ├── admob.js      # AdMob configuration
│   │   ├── interstitialAds.js
│   │   ├── appOpenAds.js
│   │   ├── offlineCache.js
│   │   └── backgroundImages.js
│   ├── services/         # API services
│   │   └── api.js        # Main API client with caching
│   └── config/           # Configuration
│       ├── api.config.js
│       └── admob.js
├── server/               # Backend server
│   ├── src/
│   │   ├── index.js      # Express server entry point
│   │   ├── routes/       # API route handlers
│   │   │   ├── auth.js
│   │   │   ├── books.js
│   │   │   ├── entries.js
│   │   │   ├── sharing.js
│   │   │   ├── admin.js
│   │   │   └── uploads.js
│   │   ├── middleware/
│   │   │   └── auth.js   # JWT authentication middleware
│   │   └── db/
│   │       ├── connection.js
│   │       ├── schema.sql
│   │       └── migrate.js
│   └── data/
│       └── thavanai.db   # SQLite database
├── App.js                # Main app component with navigation
├── index.js              # Expo entry point
└── package.json
```

---

## 🔑 Key Features

### 1. **Authentication System**
- User registration and login
- JWT token-based authentication
- Token stored in AsyncStorage
- User preferences (language) stored per user
- Secure password handling (hashed on server)

**Files**: `src/utils/auth.js`, `src/services/api.js` (authAPI), `server/src/routes/auth.js`

### 2. **Book Management**
- Create/edit loan books with borrower information
- Book fields:
  - D.L. No. (Document Number)
  - Borrower Name, Father Name, Address
  - Loan Amount, Start Date, End Date
  - Number of Days (auto-generates entries)
  - Background image/color customization
- Book status: Active, Closed, Pending
- Favorite books
- Book sharing between users

**Files**: `src/screens/BookInfoScreen.js`, `src/screens/DashboardScreen.js`, `src/utils/storage.js`

### 3. **Entries Management**
- Daily payment entries with:
  - Serial Number
  - Date
  - Credit Amount (payment received)
  - Balance Amount (auto-calculated)
  - Digital Signature status
- Pagination: 10 entries per page
- Auto-fill entries based on start date and number of days
- Bulk entry creation for efficiency
- Real-time balance calculation

**Files**: `src/screens/EntriesScreen.js`, `src/utils/storage.js`

### 4. **Digital Signature System**
- **Request Signature**: Borrower can request owner signature on entries
- **Approve/Reject**: Owner can approve or reject signature requests
- **Signature Statuses**:
  - `none`: No signature
  - `signature_requested`: Request pending
  - `signed_by_request`: Approved by owner
  - `request_rejected`: Rejected by owner
- **Protection**: Approved entries cannot be edited by either party
- **Workflow**: 
  1. Borrower saves entry with payment
  2. Borrower requests signature
  3. Owner sees pending request in dashboard
  4. Owner approves/rejects
  5. Entry becomes locked after approval

**Files**: `src/screens/EntriesScreen.js`, `server/src/routes/entries.js`

### 5. **Book Sharing**
- Owners can share books with borrowers (by username)
- Shared books appear in borrower's "Shared with Me" view
- Borrowers can view entries and request signatures
- Unshare functionality
- Access control enforced on server

**Files**: `src/utils/storage.js` (sharing functions), `server/src/routes/sharing.js`

### 6. **Internationalization (i18n)**
- Full bilingual support: English and Tamil (தமிழ்)
- Language preference stored per user
- All UI text translated
- Date formatting for both languages
- Language toggle in dashboard

**Files**: `src/utils/i18n.js`, `src/components/LanguageToggle.js`

### 7. **Offline Support**
- AsyncStorage caching for books and entries
- Offline indicator component
- Cache invalidation on write operations
- Graceful degradation when server unavailable
- Read-only mode when offline (write operations blocked)

**Files**: `src/utils/offlineCache.js`, `src/components/OfflineIndicator.js`, `src/services/api.js`

### 8. **AdMob Integration**
- Banner ads in dashboard
- Interstitial ads (shown every 5th book creation)
- App open ads
- Platform-specific (native only, not web)

**Files**: `src/config/admob.js`, `src/utils/interstitialAds.js`, `src/utils/appOpenAds.js`, `src/components/BannerAd.js`

### 9. **PDF Export**
- Export book with all entries to PDF
- Includes book information and payment records
- Platform-specific sharing/download

**Files**: `src/screens/DashboardScreen.js` (handleExportBook)

### 10. **Search & Filtering**
- Search books by name, D.L. No., father name, address
- Sort by: Latest, Name, Amount, Start Date
- Filter by: Active, Pending, Closed, All
- Favorites shown first in sorted lists

**Files**: `src/screens/DashboardScreen.js`

---

## 🔄 Data Flow

### Authentication Flow
1. User enters credentials → `LoginScreen.js`
2. `auth.js` → `api.js` (authAPI.login)
3. Server validates → returns JWT token
4. Token saved to AsyncStorage
5. User data cached
6. Navigate to Dashboard

### Book Creation Flow
1. User fills form → `BookInfoScreen.js`
2. `storage.js` (saveBook) → `api.js` (booksAPI.createBook)
3. Server creates book in SQLite
4. Auto-generates entries if start date provided
5. Cache invalidated
6. Navigate to Entries screen

### Entry Update Flow
1. User edits entry → `EntriesScreen.js`
2. Balance recalculated (loan - all payments)
3. `storage.js` (updateEntry) → `api.js` (entriesAPI.saveEntry)
4. Server updates SQLite
5. Cache invalidated
6. UI refreshes

### Signature Request Flow
1. Borrower saves entry
2. Borrower clicks "Request Signature"
3. `storage.js` (requestSignature) → `api.js` (entriesAPI.requestSignature)
4. Server updates entry status to `signature_requested`
5. Owner sees pending count in dashboard
6. Owner approves/rejects → Entry locked

---

## 🗄️ Database Schema

### Tables (SQLite)

**users**
- id, username (unique), password (hashed), full_name
- preferred_language, created_at, updated_at

**books**
- id (text), owner_id, dl_no, name, father_name, address
- loan_amount, start_date, end_date, status
- background_color, background_image
- created_at, updated_at

**entries**
- id (text), book_id, serial_number, page_number
- date, amount, remaining
- signature_status, signature_requested_by, signed_by, signed_at
- created_at, updated_at
- UNIQUE(book_id, serial_number)

**book_shares**
- id, book_id, shared_with_user_id, created_at
- UNIQUE(book_id, shared_with_user_id)

**book_pages** (metadata)
- id, book_id, max_page, updated_at
- UNIQUE(book_id)

---

## 🔐 Security & Authentication

### JWT Authentication
- Token stored in AsyncStorage (`@auth_token`)
- Token sent in `Authorization: Bearer <token>` header
- Middleware: `server/src/middleware/auth.js`
- Token validation on protected routes

### Access Control
- Books: Only owner or shared users can access
- Entries: Inherit book access
- Signature: Cannot approve own request
- Admin routes: Protected by authentication

### Data Validation
- Server-side validation for all inputs
- SQL injection prevention (parameterized queries)
- XSS protection (React Native escapes by default)

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `GET /users` - Get all users

### Books (`/api/books`)
- `GET /` - Get all books (owned + shared)
- `GET /:id` - Get single book
- `POST /` - Create book
- `PUT /:id` - Update book
- `DELETE /:id` - Delete book
- `PATCH /:id/close` - Close book
- `PATCH /:id/reopen` - Reopen book
- `PATCH /:id/favorite` - Toggle favorite

### Entries (`/api/entries`)
- `GET /book/:bookId` - Get all entries for book
- `POST /` - Create/update entry
- `POST /bulk` - Bulk create entries
- `POST /:id/request-signature` - Request signature
- `POST /:id/approve-signature` - Approve signature
- `POST /:id/reject-signature` - Reject signature

### Sharing (`/api/sharing`)
- `POST /` - Share book with user
- `GET /:bookId` - Get users book is shared with
- `DELETE /:bookId/:userId` - Unshare book

---

## 🎨 UI/UX Features

### Design System
- **Primary Color**: `#2196F3` (Blue)
- **Secondary Color**: `#7678b1` (Purple)
- **Accent Colors**: `#4CAF50` (Green), `#e91e63` (Pink)
- **Single-line card design** for book list
- **Custom backgrounds** for books (images/colors)
- **Responsive layout** for web, iOS, Android

### Components
- **ErrorBoundary**: Catches React errors gracefully
- **OfflineIndicator**: Shows connection status
- **LanguageToggle**: Quick language switch
- **DatePicker**: Cross-platform date picker
- **BannerAd**: AdMob banner component

### Navigation
- Stack Navigator with 6 screens
- Conditional initial route (Login vs Dashboard)
- Header customization per screen
- Back navigation support

---

## 🚀 Performance Optimizations

### Caching Strategy
- **In-memory cache**: 5-minute TTL for books/entries
- **AsyncStorage cache**: Persistent offline cache
- **Cache invalidation**: On write operations
- **Smart refresh**: Pull-to-refresh in dashboard

### Batch Operations
- **Bulk entry creation**: Single API call for all entries
- **Parallel loading**: Load books and entries concurrently
- **Lazy loading**: Users loaded in background

### Code Splitting
- Platform-specific imports (AdMob only on native)
- Conditional module loading
- Error boundaries for isolation

---

## 🐛 Known Issues & Technical Debt

### Current Limitations
1. **Offline writes disabled**: Cannot create/edit while offline
2. **Image upload**: Only works on web (FileReader API)
3. **Database migration**: Manual migration scripts
4. **Error handling**: Some errors may not be user-friendly
5. **Type safety**: No TypeScript (all JavaScript)

### Technical Debt
1. **Legacy database.js**: Still exists but deprecated (AsyncStorage-based)
2. **Console.log statements**: Many debug logs in production code
3. **Hardcoded values**: Some magic numbers/strings
4. **API URL**: Hardcoded in `api.js` (should use env vars)
5. **No unit tests**: Testing infrastructure missing

---

## 🔧 Configuration

### API Configuration
- **Production**: `https://tapi.thesrsconsulting.in/api`
- **Development**: `http://192.168.1.17:3000/api` (commented)
- Configured in: `src/services/api.js`

### AdMob Configuration
- App ID: `ca-app-pub-2582947091237108~3955174028`
- Configured in: `app.json`, `src/config/admob.js`

### App Configuration
- Package: `com.thesrsconsulting.tapp`
- Version: `0.0.3` (versionCode: 3)
- Expo SDK: 54
- React Native: 0.81.5

---

## 📱 Platform Support

### Supported Platforms
- ✅ **iOS**: Native support, tested on physical devices
- ✅ **Android**: Native support, AAB builds generated
- ✅ **Web**: Full functionality (except ads, native features)

### Platform-Specific Code
- **Web**: Uses `window.confirm` instead of `Alert.alert`
- **Native**: AdMob integration
- **iOS**: Different date picker behavior
- **Android**: Edge-to-edge enabled

---

## 🧪 Testing & Deployment

### Build Configuration
- **EAS Build**: Configured in `eas.json`
- **Android AAB**: Generated for Play Store
- **iOS**: Xcode build required

### Deployment Scripts
- `deploy-production.sh`: Server deployment
- `build-and-deploy.sh`: Full build process

### Environment Setup
- Node.js 16+ required
- Expo CLI for development
- Android Studio / Xcode for native builds

---

## 📝 Key Functions Reference

### Authentication
- `getCurrentUser()`: Get logged-in user
- `loginUser(username, password)`: Login
- `registerUser(...)`: Register
- `logoutUser()`: Logout

### Books
- `getAllBooks(forceRefresh)`: Get all books
- `saveBook(bookData)`: Create book
- `updateBook(bookId, bookData)`: Update book
- `deleteBook(bookId)`: Delete book
- `closeBook(bookId)`: Close book
- `shareBook(bookId, username)`: Share book

### Entries
- `getEntries(bookId)`: Get entries for book
- `saveEntry(entryData)`: Save/update entry
- `bulkSaveEntries(bookId, entries)`: Bulk create
- `requestSignature(entryId)`: Request signature
- `approveSignatureRequest(entryId)`: Approve
- `rejectSignatureRequest(entryId)`: Reject

### Utilities
- `t(key, params)`: Translate text (i18n)
- `formatDate(dateString)`: Format date DD-MM-YYYY
- `calculateBalance(loanAmount, entries)`: Calculate remaining balance

---

## 🎯 Future Improvements

### Suggested Enhancements
1. **Offline sync**: Queue writes when offline, sync when online
2. **Push notifications**: Notify on signature requests
3. **Export formats**: Excel, CSV support
4. **Analytics**: Track usage patterns
5. **Backup/Restore**: Cloud backup for data
6. **Multi-currency**: Support different currencies
7. **Reports**: Generate loan reports/statistics
8. **Dark mode**: Theme support
9. **TypeScript migration**: Type safety
10. **Unit/Integration tests**: Test coverage

---

## 📚 Documentation Files

The project includes extensive documentation:
- `README.md`: Quick start guide
- `DEPLOYMENT_GUIDE.md`: Deployment instructions
- `ADMOB_IMPLEMENTATION.md`: Ad integration guide
- `PRODUCTION_DATABASE_SETUP.md`: Database setup
- `ASO_CHECKLIST.md`: App store optimization
- And many more...

---

## 🔍 Code Quality Notes

### Strengths
- ✅ Well-organized code structure
- ✅ Separation of concerns (screens, utils, services)
- ✅ Comprehensive error handling
- ✅ Offline support implementation
- ✅ Bilingual support
- ✅ Reusable components

### Areas for Improvement
- ⚠️ Add TypeScript for type safety
- ⚠️ Reduce console.log statements
- ⚠️ Add unit tests
- ⚠️ Improve error messages
- ⚠️ Environment variable configuration
- ⚠️ Code documentation (JSDoc comments)

---

## 🎓 Learning Resources

To understand this codebase:
1. Start with `App.js` - navigation structure
2. Read `src/utils/i18n.js` - translation system
3. Study `src/services/api.js` - API client pattern
4. Review `src/screens/DashboardScreen.js` - main screen logic
5. Check `server/src/routes/entries.js` - signature workflow
6. Examine `server/src/db/schema.sql` - database structure

---

**Last Updated**: Based on codebase analysis  
**Version**: 0.0.3  
**Maintainer**: Ready for future changes and fixes

