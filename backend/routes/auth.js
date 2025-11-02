import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ email, password, name });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('🔴 [AUTH] Login - User account is inactive:', user.email);
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ [AUTH] Login successful:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      tokenGenerated: !!token,
      tokenLength: token?.length
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user - use authenticate middleware for consistency
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('🔴 [AUTH] /me - No authorization header');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token || token === 'Bearer' || token === 'null' || token === 'undefined') {
      console.log('🔴 [AUTH] /me - Invalid token format');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🟡 [AUTH] /me - Verifying token...');
    const { verifyToken } = await import('../utils/jwt.js');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('🔴 [AUTH] /me - Token verification failed');
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.log('🟡 [AUTH] /me - Token decoded, userId:', decoded.userId);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('🔴 [AUTH] /me - User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      console.log('🔴 [AUTH] /me - User inactive');
      return res.status(401).json({ message: 'User account is inactive' });
    }

    console.log('✅ [AUTH] /me - User authenticated:', { id: user._id, email: user.email, role: user.role });
    res.json({ user });
  } catch (error) {
    console.error('🔴 [AUTH] /me - Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

