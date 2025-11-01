import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  },
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Episode'
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationReason: String,
  reports: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    reportedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

commentSchema.index({ contentId: 1, createdAt: -1 });
commentSchema.index({ newsId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

export default mongoose.model('Comment', commentSchema);

