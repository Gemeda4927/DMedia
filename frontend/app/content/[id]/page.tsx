'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { contentApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useNotifications } from '@/lib/notifications';
import VideoPlayer from '@/components/VideoPlayer';
import Link from 'next/link';
import { FiBookmark, FiBookmarkCheck, FiPlay } from 'react-icons/fi';

export default function ContentDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const { showError, showWarning, showSuccess } = useNotifications();
  const [content, setContent] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [watchData, setWatchData] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchContent();
      fetchEpisodes();
      if (isAuthenticated) {
        checkBookmark();
      }
    }
  }, [params.id, isAuthenticated]);

  const fetchContent = async () => {
    try {
      const response = await contentApi.getById(params.id as string);
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    try {
      const response = await contentApi.getEpisodes(params.id as string);
      setEpisodes(response.data.episodes);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await userApi.getProfile();
      const bookmarks = response.data.user.bookmarks || [];
      setIsBookmarked(bookmarks.some((b: any) => b.contentId === params.id));
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showWarning('Please login to bookmark content', 'Login Required');
      return;
    }

    try {
      if (isBookmarked) {
        await userApi.removeBookmark(params.id as string);
        setIsBookmarked(false);
        showSuccess('Bookmark removed', 'Success');
      } else {
        await userApi.addBookmark(params.id as string);
        setIsBookmarked(true);
        showSuccess('Content bookmarked', 'Success');
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error updating bookmark', 'Error');
    }
  };

  const handleWatch = async () => {
    if (!isAuthenticated) {
      showWarning('Please login to watch content', 'Login Required');
      return;
    }

    try {
      const response = await contentApi.watch(params.id as string);
      setWatchData(response.data);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error loading video', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Content not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Content Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="capitalize">{content.type}</span>
                <span>•</span>
                <span className="capitalize">{content.category}</span>
                <span>•</span>
                <span>{content.views} views</span>
                {content.rating?.average > 0 && (
                  <>
                    <span>•</span>
                    <span>⭐ {content.rating.average.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleBookmark}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
            >
              {isBookmarked ? (
                <FiBookmarkCheck className="w-6 h-6 text-primary-500" />
              ) : (
                <FiBookmark className="w-6 h-6" />
              )}
            </button>
          </div>

          <p className="text-gray-300 mb-6 max-w-3xl">{content.description}</p>

          <div className="flex gap-4">
            {watchData ? (
              <div className="w-full">
                <VideoPlayer
                  url={watchData.videoUrl}
                  hlsUrl={watchData.hlsUrl}
                  title={content.title}
                />
              </div>
            ) : (
              <button
                onClick={handleWatch}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-lg text-lg font-semibold flex items-center gap-2"
              >
                <FiPlay className="w-5 h-5" />
                Watch Now
              </button>
            )}
          </div>
        </div>

        {/* Episodes */}
        {episodes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Episodes</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {episodes.map((episode) => (
                <Link
                  key={episode._id}
                  href={`/content/${content._id}/episode/${episode._id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition"
                >
                  <div className="relative aspect-video">
                    <img
                      src={episode.thumbnail || content.thumbnail}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition">
                      <FiPlay className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">Episode {episode.episodeNumber}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{episode.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Content */}
        {content.relatedContent && content.relatedContent.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Related Content</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {content.relatedContent.map((related: any) => (
                <Link
                  key={related._id}
                  href={`/content/${related._id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition"
                >
                  <div className="relative aspect-video">
                    <img
                      src={related.thumbnail}
                      alt={related.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

