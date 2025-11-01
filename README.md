# Dhugaa Media Platform

A comprehensive digital media platform delivering Oromo-centric content through modern web technologies.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- Redis (optional, for caching)
- AWS S3 account (for media storage)
- Chapa/Stripe API keys (for payments)

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
- Copy `.env.example` to `.env` in both `frontend/` and `backend/` directories
- Fill in your configuration values

3. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
.
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js 14 app router
│   ├── components/   # React components
│   ├── lib/          # Utilities and helpers
│   └── public/       # Static assets
├── backend/          # Node.js/Express backend API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Custom middleware
│   └── utils/        # Utilities
└── SYSTEM_DOCUMENTATION.md
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: NextAuth.js, JWT
- **Payments**: Stripe, Chapa
- **Storage**: AWS S3
- **Real-time**: Socket.io

## 📚 Documentation

See `SYSTEM_DOCUMENTATION.md` for complete system documentation.

## 📝 License

MIT

