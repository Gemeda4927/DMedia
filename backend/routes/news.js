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
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const news = await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name')
      .select('-contentOromo -excerptOromo');

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

