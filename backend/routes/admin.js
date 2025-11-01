import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Content from '../models/Content.js';
import News from '../models/News.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalContent,
      totalNews,
      recentUsers,
      recentContent
    ] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Content.countDocuments({ isPublished: true }),
      News.countDocuments({ status: 'published' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Content.find().sort({ createdAt: -1 }).limit(5).select('title type createdAt')
    ]);

    res.json({
      stats: {
        totalUsers,
        activeSubscriptions,
        totalContent,
        totalNews
      },
      recentUsers,
      recentContent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Content management
router.get('/content', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const content = await Content.find(query)
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve content
router.post('/content/:id/approve', async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isPublished: true, publishedAt: new Date() },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

