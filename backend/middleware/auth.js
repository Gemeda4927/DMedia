import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../utils/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('🔴 [AUTH MIDDLEWARE] No authorization header');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Extract token more carefully
    let token = authHeader;
    if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
    
    // Log token info for debugging (first 20 chars and last 10 chars)
    const tokenPreview = token.length > 30 
      ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
      : token;
    
    console.log('🟡 [AUTH MIDDLEWARE] Received token:', {
      authHeaderPrefix: authHeader.substring(0, 10),
      tokenLength: token.length,
      tokenPreview: tokenPreview,
      isEmpty: !token || token.length === 0
    });
    
    if (!token || token === 'Bearer' || token === 'bearer' || token === 'null' || token === 'undefined' || token.length === 0) {
      console.log('🔴 [AUTH MIDDLEWARE] Invalid token format - token is empty or invalid');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Use the same JWT_SECRET from utils/jwt.js to ensure consistency
    console.log('🟡 [AUTH MIDDLEWARE] Verifying token with secret:', {
      secretLength: JWT_SECRET.length,
      secretPreview: JWT_SECRET.substring(0, 10) + '...',
      fromModule: 'utils/jwt.js'
    });
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [AUTH MIDDLEWARE] Token verified successfully, userId:', decoded.userId);
    } catch (jwtError) {
      console.error('🔴 [AUTH MIDDLEWARE] JWT Verification Error:', {
        name: jwtError.name,
        message: jwtError.message,
        tokenLength: token.length,
        tokenPreview: tokenPreview
      });
      
      if (jwtError.name === 'TokenExpiredError') {
        console.log('🔴 [AUTH MIDDLEWARE] Token expired at:', jwtError.expiredAt);
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        console.log('🔴 [AUTH MIDDLEWARE] Invalid token - JWT Error:', jwtError.message);
        return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
      } else if (jwtError.name === 'NotBeforeError') {
        console.log('🔴 [AUTH MIDDLEWARE] Token not active yet');
        return res.status(401).json({ message: 'Token not active', code: 'TOKEN_NOT_ACTIVE' });
      } else {
        console.log('🔴 [AUTH MIDDLEWARE] Token verification failed:', jwtError.message);
        return res.status(401).json({ message: 'Token verification failed', code: 'TOKEN_ERROR' });
      }
    }

    if (!decoded || !decoded.userId) {
      console.log('🔴 [AUTH MIDDLEWARE] Invalid token payload');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('🔴 [AUTH MIDDLEWARE] User not found:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      console.log('🔴 [AUTH MIDDLEWARE] User account is inactive:', user.email);
      return res.status(401).json({ message: 'User account is inactive' });
    }

    console.log('✅ [AUTH MIDDLEWARE] User authenticated:', { id: user._id, email: user.email, role: user.role });
    req.user = user;
    next();
  } catch (error) {
    console.error('🔴 [AUTH MIDDLEWARE] Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed', code: 'AUTH_ERROR' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

export const checkSubscription = (requiredTier = 'free') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const tierLevels = { free: 0, premium: 1, pro: 2, enterprise: 3 };
    const userTier = req.user.subscriptionTier || 'free';
    
    if (tierLevels[userTier] < tierLevels[requiredTier] || 
        req.user.subscriptionStatus !== 'active') {
      return res.status(403).json({ 
        message: 'Subscription required',
        requiredTier 
      });
    }

    next();
  };
};

