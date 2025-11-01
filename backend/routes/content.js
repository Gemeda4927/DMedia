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
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .select('-contentOromo -descriptionOromo');

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

