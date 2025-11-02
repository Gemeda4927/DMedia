import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import contentRoutes from './routes/content.js';
import subscriptionRoutes from './routes/subscriptions.js';
import newsRoutes from './routes/news.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import youtubeRoutes from './routes/youtube.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Database connection
const connectDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dhugaa-media';
    
    if (!MONGO_URI || MONGO_URI.includes('xxxxx') || MONGO_URI.includes('<YOUR_')) {
      console.error('❌ Invalid MongoDB URI. Please check your .env file and replace placeholders with actual values.');
      console.error('Expected format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>');
      process.exit(1);
    }
    
    await mongoose.connect(MONGO_URI);
    
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Tip: Check your MongoDB Atlas cluster name and network access settings');
      console.error('💡 Ensure your IP is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('💡 Authentication failed. Please check:');
      console.error('   1. Username and password are correct in MongoDB Atlas');
      console.error('   2. Password may need URL encoding if it contains special characters');
      console.error('   3. Database user exists and has proper permissions');
      console.error('   4. Try resetting the password in MongoDB Atlas Dashboard');
    }
    process.exit(1);
  }
};

// Initialize database connection
connectDatabase();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/youtube', youtubeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;

