import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateNews, validateNewsId, validateNewsSlug } from '../middleware/validation.js';
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

// Get single news article by ID (must come before :slug route)
router.get('/id/:id', authenticate, async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const news = await News.findById(req.params.id)
      .populate('author', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership or admin
    if (news.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ news });
  } catch (error) {
    console.error('Get news by ID error:', error);
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
router.post('/', authenticate, authorize('admin', 'creator'), validateNews, async (req, res) => {
  try {
    // Generate slug from title
    let slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure unique slug
    let slugExists = await News.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${slug}-${counter}`;
      slugExists = await News.findOne({ slug });
      counter++;
    }

    const news = new News({
      ...req.body,
      slug,
      author: req.user._id,
      status: req.body.status || 'draft'
    });

    await news.save();
    res.status(201).json({
      message: 'News article created successfully',
      news
    });
  } catch (error) {
    console.error('Create news error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    if (error.code === 17262) {
      // MongoDB language override error - text index needs to be recreated
      console.error('MongoDB text index language error:', error.message);
      console.error('Run: npm run fix-indexes to fix this issue');
      return res.status(500).json({ 
        message: 'Database configuration error. Text index needs to be fixed.',
        details: 'Please run "npm run fix-indexes" in the backend directory, then restart the server.'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
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
      return res.status(403).json({ message: 'Access denied. You can only edit your own articles.' });
    }

    // Regenerate slug if title changed
    if (req.body.title && req.body.title !== news.title) {
      let slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      let slugExists = await News.findOne({ slug, _id: { $ne: req.params.id } });
      let counter = 1;
      while (slugExists) {
        slug = `${slug}-${counter}`;
        slugExists = await News.findOne({ slug, _id: { $ne: req.params.id } });
        counter++;
      }
      req.body.slug = slug;
    }

    Object.assign(news, req.body);
    await news.save();

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
router.delete('/:id', authenticate, authorize('admin', 'creator'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership or admin
    if (news.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own articles.' });
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

