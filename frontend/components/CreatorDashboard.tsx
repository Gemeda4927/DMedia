'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiVideo,
  FiPlus,
  FiClock,
  FiEye,
  FiTrendingUp,
  FiEdit,
  FiUpload,
  FiYoutube,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { contentApi, youtubeApi } from '@/lib/api';

interface CreatorDashboardProps {
  user: any;
}

export default function CreatorDashboard({ user }: CreatorDashboardProps) {
  const [myContent, setMyContent] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    views: 0,
  });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyContent();
  }, []);

  const fetchMyContent = async () => {
    try {
      const response = await contentApi.getAll({ createdBy: user?.id, limit: 20 });
      const content = response.data?.content || [];
      setMyContent(content);
      
      setStats({
        total: content.length,
        published: content.filter((c: any) => c.isPublished && c.status === 'approved').length,
        pending: content.filter((c: any) => c.status === 'review' || c.status === 'draft').length,
        views: content.reduce((sum: number, c: any) => sum + (c.views || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setImportLoading(true);
    try {
      await youtubeApi.importVideo({
        url: youtubeUrl,
        category: 'entertainment',
        type: 'show',
      });
      setYoutubeUrl('');
      setShowImportModal(false);
      fetchMyContent();
      alert('Video imported successfully! Pending admin approval.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to import video');
    } finally {
      setImportLoading(false);
    }
  };

  const getStatusBadge = (content: any) => {
    if (content.isPublished && content.status === 'approved') {
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs flex items-center gap-1">
          <FiCheckCircle className="w-3 h-3" />
          Published
        </span>
      );
    }
    if (content.status === 'review') {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs flex items-center gap-1">
          <FiAlertCircle className="w-3 h-3" />
          Under Review
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-xs flex items-center gap-1">
        <FiClock className="w-3 h-3" />
        Draft
      </span>
    );
  };

  const statCards = [
    { icon: FiVideo, label: 'Total Content', value: stats.total, color: 'from-blue-500 to-blue-600' },
    { icon: FiCheckCircle, label: 'Published', value: stats.published, color: 'from-green-500 to-green-600' },
    { icon: FiAlertCircle, label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
    { icon: FiEye, label: 'Total Views', value: stats.views, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Creator Dashboard</h2>
          <p className="text-gray-400">Manage your content and track performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <FiYoutube className="w-5 h-5" />
            Import from YouTube
          </button>
          <Link
            href="/dashboard/content/create"
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Create Content
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* My Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">My Content</h3>
          <Link href="/dashboard/content" className="text-primary-400 hover:text-primary-300 text-sm">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myContent.map((item: any, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all"
            >
              <div className="aspect-video relative">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">{getStatusBadge(item)}</div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2 line-clamp-2">{item.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span className="capitalize">{item.category}</span>
                  <span className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    {item.views || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/content/${item._id}/edit`}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-center text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/content/${item._id}`}
                    className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-center text-sm transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {myContent.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiVideo className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No content yet. Create your first piece of content!</p>
          </div>
        )}
      </div>

      {/* Import YouTube Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Import from YouTube</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleImportYouTube} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {importLoading ? 'Importing...' : 'Import Video'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

