# Migration Guide: Client-Server Architecture

This guide explains how to migrate from local storage to the new client-server architecture.

## Overview

The app now uses a **client-server model** with:
- **Server**: Node.js/Express API with SQLite database (`/server` directory)
- **Client**: React Native app with API integration (`/src` directory)
- **API Service**: Handles all server communication with local caching (`/src/services/api.js`)

## Architecture

```
┌─────────────────────────────────────────┐
│         React Native App (Client)       │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   UI Components (Screens)          │ │
│  └──────────────┬─────────────────────┘ │
│                 │                        │
│  ┌──────────────▼─────────────────────┐ │
│  │   API Service (with caching)       │ │
│  │   /src/services/api.js             │ │
│  └──────────────┬─────────────────────┘ │
│                 │ HTTP/REST              │
└─────────────────┼─────────────────────────┘
                  │
                  │ JWT Auth
                  │
┌─────────────────▼─────────────────────────┐
│         Express Server (Backend)          │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   REST API Routes                    │ │
│  │   /server/src/routes/                │ │
│  └──────────────┬───────────────────────┘ │
│                 │                          │
│  ┌──────────────▼───────────────────────┐ │
│  │   SQLite Database                    │ │
│  │   /server/data/thavanai.db           │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Quick Start

### 1. Start the Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start server (development mode with auto-reload)
npm run dev
```

Server will start at `http://localhost:3000`

### 2. Configure Client

Update the API URL in `/src/config/api.config.js`:

```javascript
export const API_CONFIG = {
  DEV_URL: 'http://localhost:3000/api',  // Local development
  PROD_URL: 'https://your-server.com/api',  // Production
};
```

### 3. Update Frontend Code

The existing frontend code needs to be updated to use the new API service instead of direct AsyncStorage. Here's how to migrate each module:

#### A. Authentication (`src/utils/auth.js`)

**Before** (AsyncStorage):
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export async function registerUser(username, password, fullName, language) {
  // ... AsyncStorage operations ...
}
```

**After** (API):
```javascript
import { authAPI } from '../services/api';

export async function registerUser(username, password, fullName, language) {
  return await authAPI.register(username, password, fullName, language);
}

export async function loginUser(username, password) {
  return await authAPI.login(username, password);
}

export async function getCurrentUser() {
  return await authAPI.getCurrentUser();
}

export async function logoutUser() {
  return await authAPI.logout();
}

export async function getAllUsersForDisplay() {
  return await authAPI.getAllUsers();
}
```

#### B. Storage (`src/utils/storage.js`)

**Before** (AsyncStorage):
```javascript
export async function saveBook(bookData) {
  const books = await getAllBooks();
  books.push(bookData);
  await AsyncStorage.setItem('@books', JSON.stringify(books));
}
```

**After** (API):
```javascript
import { booksAPI, entriesAPI, sharingAPI } from '../services/api';

// Books
export async function saveBook(bookData) {
  return await booksAPI.createBook(bookData);
}

export async function getAllBooks() {
  return await booksAPI.getAllBooks();
}

export async function getBook(bookId) {
  return await booksAPI.getBook(bookId);
}

export async function updateBook(bookId, bookData) {
  return await booksAPI.updateBook(bookId, bookData);
}

export async function deleteBook(bookId) {
  return await booksAPI.deleteBook(bookId);
}

export async function closeBook(bookId) {
  return await booksAPI.closeBook(bookId);
}

export async function reopenBook(bookId) {
  return await booksAPI.reopenBook(bookId);
}

// Entries
export async function getEntries(bookId) {
  return await entriesAPI.getEntries(bookId);
}

export async function saveEntry(entryData) {
  return await entriesAPI.saveEntry(entryData);
}

export async function updateEntry(entryId, entryData) {
  return await entriesAPI.saveEntry(entryData);
}

export async function requestSignature(entryId, requesterId) {
  return await entriesAPI.requestSignature(entryId);
}

export async function approveSignatureRequest(entryId, approverId) {
  return await entriesAPI.approveSignature(entryId);
}

export async function rejectSignatureRequest(entryId) {
  return await entriesAPI.rejectSignature(entryId);
}

// Sharing
export async function shareBook(bookId, username) {
  return await sharingAPI.shareBook(bookId, username);
}

export async function getBookShares(bookId) {
  return await sharingAPI.getBookShares(bookId);
}

export async function unshareBook(bookId, userId) {
  return await sharingAPI.unshareBook(bookId, userId);
}
```

### 4. Benefits of New Architecture

#### ✅ Multi-Device Sync
- Data is stored on the server
- Same data accessible from any device
- Install/uninstall doesn't lose data

#### ✅ Performance
- Local caching for fast loading
- Only fetches when data is stale (5-minute cache)
- Optimistic UI updates

#### ✅ Scalability
- Easy to add more features
- Can support web, iOS, and Android from one API
- Easy to add admin panel or other clients

#### ✅ Data Integrity
- Server-side validation
- SQL database with foreign keys
- Transaction support

#### ✅ OpenAPI Documentation
- Auto-generated API docs at `/api-docs`
- Easy for third-party integrations
- Can generate API clients in any language

## API Examples

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","fullName":"Test User"}'

# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' | jq -r '.token')

# Create book
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"book1","name":"Test Book","loanAmount":10000,"startDate":"2025-01-01","endDate":"2025-04-10"}'

# Get all books
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript/React Native

```javascript
import { booksAPI } from './src/services/api';

// Get all books
const books = await booksAPI.getAllBooks();

// Create a book
await booksAPI.createBook({
  id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'John Doe',
  dlNo: '123',
  loanAmount: 50000,
  startDate: '2025-01-01',
  endDate: '2025-04-10',
});

// Entries
const entries = await entriesAPI.getEntries(bookId);
await entriesAPI.saveEntry({
  id: entryId,
  bookId: bookId,
  serialNumber: 1,
  pageNumber: 1,
  date: '2025-01-01',
  amount: 500,
  remaining: 49500,
});
```

## Deployment

### Server Deployment

1. **Copy server directory to production**
   ```bash
   scp -r server user@your-server.com:/var/www/thavanai-api/
   ```

2. **Install dependencies**
   ```bash
   cd /var/www/thavanai-api
   npm install --production
   ```

3. **Run migrations**
   ```bash
   npm run migrate
   ```

4. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name thavanai-api
   pm2 save
   pm2 startup
   ```

5. **Set up nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Client Configuration

Update `/src/config/api.config.js` with your production URL:

```javascript
export const API_CONFIG = {
  DEV_URL: 'http://localhost:3000/api',
  PROD_URL: 'https://your-domain.com/api',  // ← Update this
};
```

## Troubleshooting

### Can't connect to server
- Check server is running: `curl http://localhost:3000/health`
- Check firewall allows port 3000
- Verify API_CONFIG has correct URL

### Authentication errors
- Check token is being saved: Check AsyncStorage `@auth_token`
- Token expires after 30 days - re-login required
- Verify Authorization header format: `Bearer <token>`

### Data not syncing
- Clear cache: Call `clearAllCaches()` from api.js
- Force refresh: Pass `forceRefresh: true` to API calls
- Check server logs for errors

## Next Steps

1. **Update all screens** to use the new API service
2. **Test thoroughly** with real data
3. **Deploy server** to production
4. **Update client config** with production URL
5. **Build and release** mobile app

## Support

- Server API docs: http://localhost:3000/api-docs
- OpenAPI spec: `/server/openapi.yaml`
- Server README: `/server/README.md`

