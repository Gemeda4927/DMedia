import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Episode'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true
});

// Ensure one rating per user per content/episode
ratingSchema.index({ userId: 1, contentId: 1 }, { unique: true, sparse: true });
ratingSchema.index({ userId: 1, episodeId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Rating', ratingSchema);

