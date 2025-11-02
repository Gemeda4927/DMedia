import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import axios from 'axios';
import Content from '../models/Content.js';

const router = express.Router();

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Fetch video details from YouTube
router.post('/fetch-video', authenticate, authorize('admin', 'creator'), async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    if (!YOUTUBE_API_KEY) {
      // Fallback: Use oEmbed API which doesn't require API key
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const oembedResponse = await axios.get(oembedUrl);
        const { title, thumbnail_url, author_name } = oembedResponse.data;
        
        return res.json({
          videoId,
          title,
          thumbnail: thumbnail_url,
          channel: author_name,
          url,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          source: 'youtube'
        });
      } catch (error) {
        return res.status(400).json({ message: 'Failed to fetch video information' });
      }
    }

    // Use YouTube Data API v3
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        id: videoId,
        key: YOUTUBE_API_KEY,
        part: 'snippet,contentDetails,statistics'
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const video = response.data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    const statistics = video.statistics;

    // Calculate duration in seconds
    const durationMatch = contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let duration = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]) || 0;
      const minutes = parseInt(durationMatch[2]) || 0;
      const seconds = parseInt(durationMatch[3]) || 0;
      duration = hours * 3600 + minutes * 60 + seconds;
    }

    res.json({
      videoId,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      channel: snippet.channelTitle,
      channelId: snippet.channelId,
      publishedAt: snippet.publishedAt,
      duration,
      viewCount: parseInt(statistics.viewCount) || 0,
      likeCount: parseInt(statistics.likeCount) || 0,
      url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      source: 'youtube',
      tags: snippet.tags || []
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ message: 'Failed to fetch video information' });
  }
});

// Import video from YouTube to content library
router.post('/import-video', authenticate, authorize('admin', 'creator'), async (req, res) => {
  try {
    const { url, category, type, isPremium, tags } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    // Fetch video details
    let videoData;
    if (YOUTUBE_API_KEY) {
      const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
        params: {
          id: videoId,
          key: YOUTUBE_API_KEY,
          part: 'snippet,contentDetails'
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const video = response.data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;

      const durationMatch = contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      let duration = 0;
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]) || 0;
        const minutes = parseInt(durationMatch[2]) || 0;
        const seconds = parseInt(durationMatch[3]) || 0;
        duration = hours * 3600 + minutes * 60 + seconds;
      }

      videoData = {
        title: snippet.title,
        description: snippet.description.substring(0, 500), // Limit description
        thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
        duration,
        tags: snippet.tags || []
      };
    } else {
      // Fallback to oEmbed
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const oembedResponse = await axios.get(oembedUrl);
      videoData = {
        title: oembedResponse.data.title,
        description: '',
        thumbnail: oembedResponse.data.thumbnail_url
      };
    }

    // Create content entry
    const content = new Content({
      title: videoData.title,
      description: videoData.description || `Imported from YouTube: ${videoData.title}`,
      type: type || 'show',
      category: category || 'entertainment',
      tags: tags || videoData.tags || [],
      thumbnail: videoData.thumbnail,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      youtubeVideoId: videoId,
      youtubeEmbedUrl: `https://www.youtube.com/embed/${videoId}`,
      duration: videoData.duration,
      isPremium: isPremium || false,
      isPublished: false, // Requires admin approval
      status: 'review',
      createdBy: req.user._id
    });

    await content.save();

    res.status(201).json({
      message: 'Video imported successfully. Pending admin approval.',
      content
    });
  } catch (error) {
    console.error('Import video error:', error);
    res.status(500).json({ message: 'Failed to import video' });
  }
});

// Search YouTube videos
router.get('/search', authenticate, authorize('admin', 'creator'), async (req, res) => {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    if (!YOUTUBE_API_KEY) {
      return res.status(400).json({ message: 'YouTube API key not configured' });
    }

    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        q,
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        type: 'video',
        maxResults: Math.min(parseInt(maxResults), 50),
        videoEmbeddable: 'true'
      }
    });

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
    }));

    res.json({ videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ message: 'Failed to search YouTube' });
  }
});

export default router;

