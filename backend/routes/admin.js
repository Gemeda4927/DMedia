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
      pendingContent,
      pendingNews,
      recentUsers,
      recentContent,
      recentNews
    ] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Content.countDocuments({ isPublished: true }),
      News.countDocuments({ status: 'published' }),
      Content.countDocuments({ status: 'review' }),
      News.countDocuments({ status: 'review' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Content.find().sort({ createdAt: -1 }).limit(5).select('title type createdAt'),
      News.find().sort({ createdAt: -1 }).limit(5).select('title category createdAt status').populate('author', 'name')
    ]);

    res.json({
      stats: {
        totalUsers,
        activeSubscriptions,
        totalContent,
        totalNews,
        pendingContent,
        pendingNews
      },
      recentUsers,
      recentContent,
      recentNews
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

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { role, subscriptionTier, subscriptionStatus, isActive } = req.body;
    const updateData = {};
    
    if (role) updateData.role = role;
    if (subscriptionTier) updateData.subscriptionTier = subscriptionTier;
    if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
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

    res.json({
      message: 'Content approved successfully',
      content
    });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject content
router.post('/content/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', isPublished: false, rejectionReason: reason },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({
      message: 'Content rejected successfully',
      content
    });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// News management endpoints
router.get('/news', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const news = await News.find(query)
      .populate('author', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await News.countDocuments(query);

    res.json({
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single news article
router.get('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve news article
router.post('/news/:id/approve', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved', 
        publishedAt: new Date() 
      },
      { new: true }
    ).populate('author', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json({
      message: 'News article approved successfully',
      news
    });
  } catch (error) {
    console.error('Approve news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject news article
router.post('/news/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected', 
        rejectionReason: reason 
      },
      { new: true }
    ).populate('author', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json({
      message: 'News article rejected successfully',
      news
    });
  } catch (error) {
    console.error('Reject news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish news article (set status to published)
router.post('/news/:id/publish', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'published', 
        publishedAt: new Date() 
      },
      { new: true }
    ).populate('author', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json({
      message: 'News article published successfully',
      news
    });
  } catch (error) {
    console.error('Publish news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update news article
router.put('/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json({
      message: 'News article updated successfully',
      news
    });
  } catch (error) {
    console.error('Update news error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete news article
router.delete('/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json({
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

