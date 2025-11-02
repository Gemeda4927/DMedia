'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi, contentApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiClock, FiVideo, FiPlay } from 'react-icons/fi';
import Navbar from '@/components/Navbar';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchHistory();
  }, [isAuthenticated, router]);

  const fetchHistory = async () => {
    try {
      const response = await userApi.getProfile();
      const watchHistory = response.data.user?.watchHistory || [];
      
      // Fetch details for each item in history
      const historyDetails = await Promise.all(
        watchHistory.map(async (historyItem: any) => {
          try {
            const contentRes = await contentApi.getById(historyItem.contentId);
            return {
              ...contentRes.data.content,
              watchedAt: historyItem.watchedAt,
              progress: historyItem.progress || 0,
            };
          } catch {
            return null;
          }
        })
      );
      
      setHistory(historyDetails.filter(Boolean).sort((a, b) => 
        new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold mb-2">Watch History</h1>
              <p className="text-gray-400">Continue watching from where you left off</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
              <FiClock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No watch history</h3>
              <p className="text-gray-400">Start watching content to see your history here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <motion.a
                  key={item._id}
                  href={`/content/${item._id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-primary-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {item.featuredImage ? (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiPlay className="w-6 h-6 text-white" />
                        </div>
                        {item.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" style={{ width: `${item.progress}%` }} />
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-20 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <FiVideo className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-400 transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.description || item.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {new Date(item.watchedAt).toLocaleDateString()}
                        </span>
                        {item.progress > 0 && (
                          <span className="text-primary-400">
                            {Math.round(item.progress)}% watched
                          </span>
                        )}
                      </div>
                    </div>
                    <FiPlay className="w-6 h-6 text-gray-400 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}



