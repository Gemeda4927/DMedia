# Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. MongoDB instance (local or cloud like MongoDB Atlas)
3. AWS S3 account (for media storage)
4. Domain name (optional)
5. Vercel/Netlify account (for frontend)
6. Railway/Render/Heroku account (for backend)

## Backend Deployment

### 1. Environment Setup

Create `.env` file in `backend/` directory:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dhugaa-media

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d

AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=dhugaa-media-uploads

STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
CHAPA_SECRET_KEY=your-chapa-secret-key
```

### 2. Deploy to Railway/Render

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### 3. MongoDB Setup

1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Frontend Deployment

### 1. Environment Setup

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com

NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

### 2. Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in `frontend/` directory
3. Follow prompts
4. Set environment variables in Vercel dashboard

## Post-Deployment

1. Update CORS settings in backend
2. Configure CDN for static assets
3. Set up SSL certificates
4. Configure domain DNS
5. Test all functionality
6. Monitor logs and errors

## Monitoring

- Set up Sentry for error tracking
- Configure Vercel Analytics
- Set up MongoDB monitoring
- Configure AWS CloudWatch for S3

