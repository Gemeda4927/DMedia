import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider;
    },
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['viewer', 'subscriber', 'admin', 'creator'],
    default: 'viewer'
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium', 'pro', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'inactive'
  },
  subscriptionExpiresAt: {
    type: Date
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'facebook'],
    default: null
  },
  oauthId: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  profile: {
    avatar: String,
    bio: String,
    location: String,
    preferredLanguage: {
      type: String,
      enum: ['en', 'om'],
      default: 'en'
    }
  },
  watchHistory: [{
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
    progress: Number, // in seconds
    watchedAt: { type: Date, default: Date.now }
  }],
  bookmarks: [{
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    addedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    autoPlay: { type: Boolean, default: true },
    quality: { type: String, enum: ['360p', '480p', '720p', '1080p', '4k'], default: '720p' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model('User', userSchema);

