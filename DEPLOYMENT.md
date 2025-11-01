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

**⚠️ SECURITY WARNING:** Never commit `.env` files to version control. They contain sensitive credentials.

Create `.env` file in `backend/` directory (this file is already in `.gitignore`):

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# ⚠️ IMPORTANT: Replace with your actual MongoDB Atlas connection string
# Format: mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE_NAME>?retryWrites=true&w=majority
# Get this from MongoDB Atlas dashboard > Connect > Connect your application
MONGO_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/<DATABASE_NAME>?retryWrites=true&w=majority

# ⚠️ IMPORTANT: Use a strong, randomly generated secret (minimum 32 characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<YOUR_RANDOM_JWT_SECRET_MIN_32_CHARS>
JWT_EXPIRES_IN=7d

# AWS Configuration (optional - for media storage)
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_KEY>
AWS_REGION=us-east-1
AWS_S3_BUCKET=dhugaa-media-uploads

# Payment Providers (optional)
STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>
CHAPA_SECRET_KEY=<YOUR_CHAPA_SECRET_KEY>
```

### 2. Deploy to Railway/Render

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### 3. MongoDB Setup

1. Create MongoDB Atlas account
2. Create cluster
3. Create database user (username and password)
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs - less secure)
5. Get connection string from "Connect" > "Connect your application"
6. Replace `<YOUR_USERNAME>`, `<YOUR_PASSWORD>`, `<YOUR_CLUSTER>`, and `<DATABASE_NAME>` in `MONGO_URI`
7. **Important:** If credentials are leaked, immediately rotate them in MongoDB Atlas

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

## Security Best Practices

### Protecting Credentials

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use environment variables** in deployment platforms (Railway, Render, Vercel)
3. **Rotate secrets regularly** - Especially after team member changes
4. **Use different credentials** for development, staging, and production

### If Credentials Are Leaked

1. **Immediately rotate the leaked secret:**
   - MongoDB: Go to Atlas > Database Access > Edit user > Change password
   - JWT Secret: Generate new secret and update all environments
   - API Keys: Revoke and regenerate in respective dashboards

2. **Check security logs:**
   - MongoDB Atlas: Review access logs and audit logs
   - Check for unauthorized access or suspicious activity

3. **Revoke old credentials** after rotating

4. **Update all environments** with new credentials (dev, staging, production)

5. **Review git history** - If credentials were committed, use `git-filter-repo` or BFG to remove them

### Generating Secure Secrets

```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate MongoDB password (use MongoDB Atlas password generator)
# Recommended: 12+ characters with mixed case, numbers, and symbols
```

## Monitoring

- Set up Sentry for error tracking
- Configure Vercel Analytics
- Set up MongoDB monitoring
- Configure AWS CloudWatch for S3
- Monitor MongoDB Atlas access logs regularly

