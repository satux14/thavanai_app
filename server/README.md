# Thavanai Server - Daily Installment Book API

Backend API server for the Daily Installment Book application.

## Features

- ✅ User authentication with JWT
- ✅ Books management (CRUD)
- ✅ Daily entries tracking
- ✅ Book sharing between users
- ✅ Signature requests and approvals
- ✅ SQLite database
- ✅ OpenAPI/Swagger documentation
- ✅ RESTful API design

## Prerequisites

- Node.js 16+ and npm

## Installation

```bash
cd server
npm install
```

## Database Setup

Run migrations to create the database schema:

```bash
npm run migrate
```

This will create a SQLite database at `./data/thavanai.db`.

## Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/users` - Get all users (requires auth)

### Books
- `GET /api/books` - Get all books (owned + shared)
- `POST /api/books` - Create new book
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `PATCH /api/books/:id/close` - Close book
- `PATCH /api/books/:id/reopen` - Reopen book

### Entries
- `GET /api/entries/book/:bookId` - Get all entries for a book
- `POST /api/entries` - Create or update entry
- `POST /api/entries/:entryId/request-signature` - Request signature
- `POST /api/entries/:entryId/approve-signature` - Approve signature
- `POST /api/entries/:entryId/reject-signature` - Reject signature

### Sharing
- `POST /api/sharing` - Share book with user
- `GET /api/sharing/:bookId` - Get users book is shared with
- `DELETE /api/sharing/:bookId/:userId` - Unshare book from user

## Authentication

All API endpoints (except `/health`, `/api/auth/register`, and `/api/auth/login`) require authentication.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token-here>
```

## Environment Variables

Create a `.env` file in the server directory (optional):

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## Database

The server uses SQLite stored at `./data/thavanai.db`. 

### Database Schema

- **users** - User accounts
- **books** - Daily installment books
- **entries** - Daily payment entries
- **book_shares** - Book sharing relationships
- **book_pages** - Page metadata

## Deployment

### Production Server

1. Copy the entire `server` directory to your production server
2. Install dependencies: `npm install --production`
3. Run migrations: `npm run migrate`
4. Set environment variables (JWT_SECRET, PORT)
5. Start the server: `npm start`

### Using PM2 (recommended for production)

```bash
npm install -g pm2
pm2 start src/index.js --name thavanai-api
pm2 save
pm2 startup
```

### Using systemd

Create `/etc/systemd/system/thavanai-api.service`:

```ini
[Unit]
Description=Thavanai API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable thavanai-api
sudo systemctl start thavanai-api
```

## Testing

Test the API using curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get books (requires token)
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer <your-token>"
```

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Consider rate limiting for production
- Regular database backups recommended

## Support

For issues or questions, check the OpenAPI documentation at `/api-docs` or review the source code in `src/routes/`.

