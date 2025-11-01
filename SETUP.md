# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend and backend dependencies
npm run install:all
```

### 2. Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update `backend/.env` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/dhugaa-media
   ```

### 3. Environment Variables

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and fill in:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars)
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET` - S3 bucket name
- `STRIPE_SECRET_KEY` - Stripe secret key (optional for now)
- `CHAPA_SECRET_KEY` - Chapa secret key (optional for now)

#### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local` and fill in:

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000)
- `NEXTAUTH_URL` - Frontend URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET` - Secret for NextAuth (min 32 chars)

### 4. Run Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Starts on http://localhost:3000
npm run dev:backend   # Starts on http://localhost:5000
```

### 5. Create Admin User

After starting the backend, you can create an admin user directly in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  email: "admin@dhugaa.media",
  password: "$2a$12$...", // Hashed password (use bcrypt)
  name: "Admin User",
  role: "admin",
  emailVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the registration endpoint and manually update the role in the database.

## Project Structure

```
.
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and API
│   └── public/           # Static assets
├── backend/              # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utilities
│   └── server.js         # Entry point
└── SYSTEM_DOCUMENTATION.md
```

## Features Implemented

✅ User authentication (register, login, JWT)
✅ User profiles and preferences
✅ Content management (shows, episodes)
✅ News publishing system
✅ Subscription management
✅ Watch history and bookmarks
✅ Admin dashboard
✅ Video player with HLS support
✅ Responsive UI with Tailwind CSS

## Next Steps

1. Set up AWS S3 for media storage
2. Configure payment providers (Stripe/Chapa)
3. Set up email service for notifications
4. Add more content types
5. Implement comments and ratings
6. Add search functionality
7. Set up CDN for media delivery

## Testing

1. Register a new user
2. Browse content
3. View news articles
4. Subscribe to a plan
5. Bookmark content
6. Watch videos (requires media files)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Verify network access

### CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Check backend CORS configuration

### Authentication Issues
- Verify JWT_SECRET is set
- Check token in localStorage
- Ensure backend is running

