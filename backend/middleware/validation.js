import { body, param, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Content validation
export const validateContent = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').isIn(['show', 'news', 'podcast', 'live', 'gallery']).withMessage('Invalid content type'),
  body('category').isIn(['politics', 'culture', 'sports', 'entertainment', 'education', 'news']).withMessage('Invalid category'),
  body('thumbnail').optional().trim(),
  body('videoUrl').optional().trim(),
  body('youtubeVideoId').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPremium').optional().isBoolean().withMessage('isPremium must be a boolean'),
  validateRequest
];

export const validateContentId = [
  param('id').isMongoId().withMessage('Invalid content ID'),
  validateRequest
];

// News validation
export const validateNews = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required').isLength({ min: 10, max: 500 }),
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ min: 50 }),
  body('category').isIn(['politics', 'culture', 'sports', 'entertainment', 'economy', 'technology', 'health', 'education']).withMessage('Invalid category'),
  body('featuredImage').notEmpty().isURL().withMessage('Featured image must be a valid URL'),
  body('tags').optional().isArray(),
  validateRequest
];

export const validateNewsId = [
  param('id').isMongoId().withMessage('Invalid news ID'),
  validateRequest
];

export const validateNewsSlug = [
  param('slug').trim().notEmpty().withMessage('Slug is required'),
  validateRequest
];

// User validation
export const validateUserUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('profile.bio').optional().trim().isLength({ max: 500 }),
  body('profile.location').optional().trim().isLength({ max: 100 }),
  body('profile.preferredLanguage').optional().isIn(['en', 'om']),
  body('preferences.autoPlay').optional().isBoolean(),
  body('preferences.quality').optional().isIn(['360p', '480p', '720p', '1080p', '4k']),
  validateRequest
];

export const validateUserId = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  validateRequest
];

// Pagination validation
export const validatePagination = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest
];

