import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleOromo: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true  // unique: true automatically creates an index
  },
  excerpt: {
    type: String,
    required: true
  },
  excerptOromo: String,
  content: {
    type: String,
    required: true
  },
  contentOromo: String,
  category: {
    type: String,
    enum: ['politics', 'culture', 'sports', 'entertainment', 'economy', 'technology', 'health', 'education'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    required: true
  },
  images: [String],
  videos: [{
    url: String,
    caption: String,
    type: { type: String, enum: ['youtube', 'vimeo', 'direct'] }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  scheduledPublishAt: Date,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  language: {
    type: String,
    enum: ['en', 'om', 'both'],
    default: 'om'
  }
}, {
  timestamps: true
});

// Compound indexes (slug index is created automatically by unique: true)
newsSchema.index({ category: 1, status: 1, publishedAt: -1 });
newsSchema.index({ isBreaking: 1, isFeatured: 1 });
// Text index with explicit language to avoid MongoDB language override error
// 'none' language means no language-specific stemming
// language_override points to a non-existent field to prevent MongoDB from using
// the document's 'language' field ('om' is not supported by MongoDB text indexes)
newsSchema.index({ title: 'text', content: 'text', titleOromo: 'text', contentOromo: 'text' }, { 
  default_language: 'none',
  language_override: '_no_language_field'
});

export default mongoose.model('News', newsSchema);

