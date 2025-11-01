import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.contentId')
      .populate('bookmarks.contentId');
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, profile, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, profile, preferences } },
      { new: true, runValidators: true }
    );

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to watch history
router.post('/watch-history', authenticate, async (req, res) => {
  try {
    const { contentId, episodeId, progress } = req.body;
    
    const user = await User.findById(req.user._id);
    const existingEntry = user.watchHistory.find(
      h => h.contentId.toString() === contentId && 
           (!episodeId || h.episodeId?.toString() === episodeId)
    );

    if (existingEntry) {
      existingEntry.progress = progress;
      existingEntry.watchedAt = new Date();
    } else {
      user.watchHistory.push({ contentId, episodeId, progress });
    }

    await user.save();
    res.json({ message: 'Watch history updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add bookmark
router.post('/bookmarks', authenticate, async (req, res) => {
  try {
    const { contentId } = req.body;
    const user = await User.findById(req.user._id);

    const exists = user.bookmarks.some(b => b.contentId.toString() === contentId);
    if (!exists) {
      user.bookmarks.push({ contentId });
      await user.save();
    }

    res.json({ message: 'Bookmarked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:contentId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.bookmarks = user.bookmarks.filter(
      b => b.contentId.toString() !== req.params.contentId
    );
    await user.save();

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

