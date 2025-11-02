'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi, contentApi, newsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiBookmark, FiVideo, FiBookOpen, FiX } from 'react-icons/fi';
import Navbar from '@/components/Navbar';

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchBookmarks();
  }, [isAuthenticated, router]);

  const fetchBookmarks = async () => {
    try {
      const response = await userApi.getProfile();
      // Assuming bookmarks are returned in profile
      const userBookmarks = response.data.user?.bookmarks || [];
      
      // Fetch details for each bookmark
      const bookmarkDetails = await Promise.all(
        userBookmarks.map(async (bookmarkId: string) => {
          try {
            const contentRes = await contentApi.getById(bookmarkId);
            return { ...contentRes.data.content, type: 'content' };
          } catch {
            try {
              const newsRes = await newsApi.getById(bookmarkId);
              return { ...newsRes.data.news, type: 'news' };
            } catch {
              return null;
            }
          }
        })
      );
      
      setBookmarks(bookmarkDetails.filter(Boolean));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (contentId: string) => {
    try {
      await userApi.removeBookmark(contentId);
      setBookmarks(bookmarks.filter(b => b._id !== contentId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookmarks</h1>
              <p className="text-gray-400">Content and news you've saved for later</p>
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
              <FiBookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
              <p className="text-gray-400">Start bookmarking content you want to revisit later</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all group"
                >
                  {bookmark.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={bookmark.featuredImage}
                        alt={bookmark.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <button
                        onClick={() => removeBookmark(bookmark._id)}
                        className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {bookmark.type === 'content' ? (
                        <FiVideo className="w-4 h-4 text-primary-400" />
                      ) : (
                        <FiBookOpen className="w-4 h-4 text-purple-400" />
                      )}
                      <span className="text-xs text-gray-400 capitalize">{bookmark.type}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {bookmark.title}
                    </h3>
                    {bookmark.excerpt && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4">{bookmark.excerpt}</p>
                    )}
                    <a
                      href={bookmark.type === 'content' ? `/content/${bookmark._id}` : `/news/${bookmark.slug}`}
                      className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                    >
                      View {bookmark.type === 'content' ? 'Content' : 'Article'} →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}



