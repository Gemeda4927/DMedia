import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleOromo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  descriptionOromo: {
    type: String
  },
  type: {
    type: String,
    enum: ['show', 'news', 'podcast', 'live', 'gallery'],
    required: true
  },
  category: {
    type: String,
    enum: ['politics', 'culture', 'sports', 'entertainment', 'education', 'news'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    required: true
  },
  coverImage: String,
  videoUrl: String,
  audioUrl: String,
  hlsUrl: String, // For adaptive streaming
  youtubeVideoId: String, // YouTube video ID
  youtubeEmbedUrl: String, // YouTube embed URL
  source: {
    type: String,
    enum: ['upload', 'youtube', 'vimeo', 'other'],
    default: 'upload'
  },
  duration: Number, // in seconds
  quality: [{
    type: String,
    enum: ['360p', '480p', '720p', '1080p', '4k']
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  scheduledPublishAt: Date,
  releaseDate: Date,
  language: {
    type: String,
    enum: ['en', 'om', 'both'],
    default: 'om'
  },
  subtitles: [{
    language: String,
    url: String
  }],
  downloadEnabled: {
    type: Boolean,
    default: false
  },
  metadata: {
    director: String,
    producer: String,
    cast: [String],
    year: Number,
    country: String
  },
  relatedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
// Text index with explicit language to avoid MongoDB language override error
// 'none' language means no language-specific stemming
// language_override points to a non-existent field to prevent MongoDB from using
// the document's 'language' field ('om' is not supported by MongoDB text indexes)
contentSchema.index({ title: 'text', description: 'text', titleOromo: 'text', descriptionOromo: 'text' }, { 
  default_language: 'none',
  language_override: '_no_language_field'
});
contentSchema.index({ type: 1, category: 1, isPublished: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ views: -1 });
contentSchema.index({ rating: -1 });

export default mongoose.model('Content', contentSchema);

