import express from 'express';
import { authenticate, checkSubscription, authorize } from '../middleware/auth.js';
import { validateContent, validateContentId } from '../middleware/validation.js';
import Content from '../models/Content.js';
import Episode from '../models/Episode.js';

const router = express.Router();

// Get all content with filtering
router.get('/', async (req, res) => {
  try {
    const { type, category, search, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };

    if (type) query.type = type;
    if (category) query.category = category;
    
    // Enhanced search with fallback to regex
    if (search) {
      try {
        // Try text search first (requires text index)
        query.$text = { $search: search };
      } catch (textError) {
        // Fallback to regex search if text index not available
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { titleOromo: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { descriptionOromo: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
    }

    const skip = (page - 1) * limit;
    let content;
    let total;

    try {
      // Try with text search first
      const sort = search && query.$text ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 };
      content = await Content.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name')
        .select('-contentOromo -descriptionOromo');
      total = await Content.countDocuments(query);
    } catch (error) {
      // If text search fails, use regex fallback
      if (search && error.message?.includes('text index')) {
        query.$text = undefined;
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { titleOromo: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { descriptionOromo: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
        delete query.$text;
        content = await Content.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'name')
          .select('-contentOromo -descriptionOromo');
        total = await Content.countDocuments(query);
      } else {
        throw error;
      }
    }

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
    console.error('Content search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single content (public or own content for creators)
router.get('/:id', validateContentId, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('relatedContent', 'title thumbnail');

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user can view (published or owner/admin)
    const token = req.headers.authorization?.replace('Bearer ', '');
    let canView = content.isPublished;

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const { JWT_SECRET } = await import('../utils/jwt.js');
        const decoded = jwt.verify(token, JWT_SECRET);
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(decoded.userId);
        
        if (user && (
          user.role === 'admin' ||
          content.createdBy.toString() === user._id.toString()
        )) {
          canView = true;
        }
      } catch (e) {
        // Invalid token, use public access rules
      }
    }

    if (!canView) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Increment views for published content
    if (content.isPublished) {
      content.views += 1;
      await content.save();
    }

    res.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get episodes for a show
router.get('/:id/episodes', async (req, res) => {
  try {
    const episodes = await Episode.find({ 
      showId: req.params.id,
      isPublished: true 
    })
      .sort({ seasonNumber: 1, episodeNumber: 1 });

    res.json({ episodes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create content (authenticated, creator/admin only)
router.post('/', authenticate, authorize('admin', 'creator'), validateContent, async (req, res) => {
  try {
    const content = new Content({
      ...req.body,
      createdBy: req.user._id,
      status: req.body.status || 'draft'
    });
    await content.save();

    res.status(201).json({
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content (authenticated, creator/admin only - owner or admin)
router.put('/:id', authenticate, authorize('admin', 'creator'), validateContentId, validateContent, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check ownership or admin
    if (content.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only edit your own content.' });
    }

    // Update fields
    Object.assign(content, req.body);
    await content.save();

    res.json({
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    console.error('Update content error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content (authenticated, creator/admin only - owner or admin)
router.delete('/:id', authenticate, authorize('admin', 'creator'), validateContentId, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check ownership or admin
    if (content.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own content.' });
    }

    // Delete related episodes
    await Episode.deleteMany({ showId: req.params.id });

    // Delete content
    await Content.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Watch content (check subscription for premium)
router.get('/:id/watch', authenticate, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content || !content.isPublished) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if premium content requires subscription
    if (content.isPremium && req.user.subscriptionTier === 'free') {
      return res.status(403).json({ message: 'Premium subscription required' });
    }

    res.json({ 
      videoUrl: content.videoUrl,
      hlsUrl: content.hlsUrl,
      quality: content.quality,
      subtitles: content.subtitles
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

