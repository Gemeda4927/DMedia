'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { contentApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiVideo, FiEdit, FiPlus, FiEye, FiTrash2, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function MyContentPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.role !== 'creator' && user?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    fetchContent();
  }, [isAuthenticated, user, router]);

  const fetchContent = async () => {
    try {
      // Fetch content created by the current user
      const response = await contentApi.getAll({ creator: user?.id });
      setContent(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await contentApi.delete(id);
      setContent(content.filter(c => c._id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
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
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Content</h1>
              <p className="text-gray-400">Manage your created content</p>
            </div>
            <Link
              href="/dashboard/content/create"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Content
            </Link>
          </div>

          {content.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
              <FiVideo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No content yet</h3>
              <p className="text-gray-400 mb-6">Start creating amazing content for your audience</p>
              <Link
                href="/dashboard/content/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Content
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all group"
                >
                  {item.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'published' ? 'bg-green-600/80 text-white' :
                          item.status === 'pending' ? 'bg-yellow-600/80 text-white' :
                          'bg-gray-600/80 text-white'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{item.description || item.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FiEye className="w-3 h-3" />
                        {item.views || 0} views
                      </span>
                      {item.createdAt && (
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/content/${item._id}/edit`}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-center text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEdit className="w-4 h-4" />
                        Edit
                      </Link>
                      <Link
                        href={`/content/${item._id}`}
                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-center text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => deleteContent(item._id)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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



