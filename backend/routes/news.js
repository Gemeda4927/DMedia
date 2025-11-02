import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import News from '../models/News.js';

const router = express.Router();

// Get all news articles
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, featured, breaking } = req.query;
    const query = { status: 'published' };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (breaking === 'true') query.isBreaking = true;
    
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
          { excerpt: { $regex: search, $options: 'i' } },
          { excerptOromo: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
    }

    const skip = (page - 1) * limit;
    let news;
    let total;

    try {
      // Try with text search first
      const sort = search && query.$text ? { score: { $meta: 'textScore' }, publishedAt: -1, createdAt: -1 } : { publishedAt: -1, createdAt: -1 };
      news = await News.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name')
        .select('-contentOromo -excerptOromo');
      total = await News.countDocuments(query);
    } catch (error) {
      // If text search fails, use regex fallback
      if (search && error.message?.includes('text index')) {
        query.$text = undefined;
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { titleOromo: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { excerptOromo: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
        delete query.$text;
        news = await News.find(query)
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('author', 'name')
          .select('-contentOromo -excerptOromo');
        total = await News.countDocuments(query);
      } else {
        throw error;
      }
    }

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
    console.error('News search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single news article
router.get('/:slug', async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug })
      .populate('author', 'name')
      .populate('relatedArticles', 'title slug featuredImage publishedAt');

    if (!news || news.status !== 'published') {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json({ news });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create news article (authenticated, admin/creator only)
router.post('/', authenticate, authorize('admin', 'creator'), async (req, res) => {
  try {
    // Generate slug from title
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const news = new News({
      ...req.body,
      slug,
      author: req.user._id
    });

    await news.save();
    res.status(201).json({ news });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update news article
router.put('/:id', authenticate, authorize('admin', 'creator'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership or admin
    if (news.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(news, req.body);
    await news.save();

    res.json({ news });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

