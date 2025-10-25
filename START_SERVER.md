# Server Startup Guide

## Quick Start

### 1. Start the Backend Server

```bash
# Terminal 1 - Start server
cd server
npm install
npm run migrate
npm start
```

Server will run on: `http://localhost:3000`

API Documentation: `http://localhost:3000/api-docs`

### 2. Start the Mobile App

```bash
# Terminal 2 - Start mobile app
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile
npx expo start --port 8082
```

Then:
- Press `w` for web browser
- Scan QR code with Expo Go app for mobile
- Or use `npx expo run:ios` for iOS simulator

## Testing the Connection

1. **Open web browser**: http://localhost:8082
2. **Register a new user**: Create an account
3. **Create a book**: Add a new installment book
4. **Check server logs**: You should see API calls in Terminal 1
5. **Check database**: `server/data/thavanai.db` will have your data

## Architecture

```
Mobile App (Port 8082)
    ↓ HTTP Requests
Server API (Port 3000)
    ↓ SQLite
Database (server/data/thavanai.db)
```

## Features Now Available

✅ **Multi-device sync**: Login from any device, see same data
✅ **Data persistence**: Data saved on server, not just device
✅ **Collaboration**: Share books, both parties can update
✅ **Offline cache**: 5-minute cache for performance
✅ **Production ready**: Deploy server to any cloud provider

## Troubleshooting

### Can't connect to server
- Make sure server is running on port 3000
- Check `src/config/api.config.js` has correct URL
- Try: `curl http://localhost:3000/api/auth/register` (should return 400)

### Database errors
- Delete `server/data/thavanai.db` and run `npm run migrate` again

### Port already in use
- Change port in `server/src/index.js`
- Update `src/config/api.config.js` to match

## Production Deployment

See `server/README.md` for deployment instructions.

