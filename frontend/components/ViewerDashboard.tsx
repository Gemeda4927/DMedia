'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiUser,
  FiBookmark,
  FiClock,
  FiStar,
  FiVideo,
  FiBookOpen,
  FiTrendingUp,
  FiHeart,
  FiPlay,
  FiArrowRight,
} from 'react-icons/fi';
import { userApi, contentApi } from '@/lib/api';

interface ViewerDashboardProps {
  user: any;
  profile: any;
}

export default function ViewerDashboard({ user, profile }: ViewerDashboardProps) {
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [recentRes, trendingRes] = await Promise.all([
        contentApi.getAll({ limit: 6, sort: 'newest' }),
        contentApi.getAll({ limit: 6, sort: 'trending' }),
      ]);
      setRecentContent(recentRes.data?.content || []);
      setTrendingContent(trendingRes.data?.content || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: FiBookmark,
      label: 'Bookmarks',
      value: profile?.bookmarks?.length || 0,
      color: 'from-blue-500 to-blue-600',
      href: '/dashboard/bookmarks',
    },
    {
      icon: FiClock,
      label: 'Watch History',
      value: profile?.watchHistory?.length || 0,
      color: 'from-purple-500 to-purple-600',
      href: '/dashboard/history',
    },
    {
      icon: FiStar,
      label: 'Subscription',
      value: user?.subscriptionTier || 'Free',
      color: 'from-yellow-500 to-yellow-600',
      href: '/subscriptions',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-2xl p-8 border border-primary-500/30"
      >
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">{user?.name}!</span>
        </h2>
        <p className="text-gray-400">Continue exploring amazing Oromo content</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={stat.href}
              className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1">{typeof stat.value === 'number' ? stat.value : stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/content"
          className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <FiVideo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold group-hover:text-primary-400 transition-colors">Browse Content</h3>
              <p className="text-gray-400 text-sm">Discover shows, podcasts, and more</p>
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/news"
          className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold group-hover:text-primary-400 transition-colors">Read News</h3>
              <p className="text-gray-400 text-sm">Stay updated with latest articles</p>
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Trending Content */}
      {trendingContent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <FiTrendingUp className="w-6 h-6 text-primary-400" />
              Trending Now
            </h3>
            <Link href="/content" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View all <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingContent.map((item: any, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/content/${item._id}`}
                  className="block group relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-primary-500/50 transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary-600/90 flex items-center justify-center">
                        <FiPlay className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <FiClock className="w-6 h-6 text-primary-400" />
              Recently Added
            </h3>
            <Link href="/content" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View all <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentContent.map((item: any, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/content/${item._id}`}
                  className="block group relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-primary-500/50 transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary-600/90 flex items-center justify-center">
                        <FiPlay className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

