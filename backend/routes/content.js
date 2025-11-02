import express from 'express';
import { authenticate, checkSubscription } from '../middleware/auth.js';
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

// Get single content
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('relatedContent', 'title thumbnail');

    if (!content || !content.isPublished) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Increment views
    content.views += 1;
    await content.save();

    res.json({ content });
  } catch (error) {
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
router.post('/', authenticate, async (req, res) => {
  try {
    if (!['admin', 'creator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const content = new Content({
      ...req.body,
      createdBy: req.user._id
    });
    await content.save();

    res.status(201).json({ content });
  } catch (error) {
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

