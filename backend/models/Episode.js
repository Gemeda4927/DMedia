import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  episodeNumber: {
    type: Number,
    required: true
  },
  seasonNumber: {
    type: Number,
    default: 1
  },
  title: {
    type: String,
    required: true
  },
  titleOromo: String,
  description: String,
  descriptionOromo: String,
  thumbnail: String,
  videoUrl: String,
  hlsUrl: String,
  duration: Number, // in seconds
  quality: [{
    type: String,
    enum: ['360p', '480p', '720p', '1080p', '4k']
  }],
  views: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
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
  releaseDate: Date,
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
    producer: String
  }
}, {
  timestamps: true
});

episodeSchema.index({ showId: 1, seasonNumber: 1, episodeNumber: 1 });
episodeSchema.index({ isPublished: 1, publishedAt: -1 });

export default mongoose.model('Episode', episodeSchema);

