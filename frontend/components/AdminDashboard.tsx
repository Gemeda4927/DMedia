'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiUsers,
  FiVideo,
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSettings,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiSend,
  FiGlobe,
} from 'react-icons/fi';
import { adminApi } from '@/lib/api';
import { useNotifications } from '@/lib/notifications';

interface AdminDashboardProps {
  user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { showSuccess, showError } = useNotifications();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [pendingContent, setPendingContent] = useState<any[]>([]);
  const [pendingNews, setPendingNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'news' | 'pending'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        dashboardRes, 
        usersRes, 
        contentRes, 
        newsRes,
        pendingContentRes, 
        pendingNewsRes
      ] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers({ limit: 10 }),
        adminApi.getContent({ limit: 10 }),
        adminApi.getNews({ limit: 10 }),
        adminApi.getContent({ status: 'review', limit: 10 }),
        adminApi.getNews({ status: 'review', limit: 10 }),
      ]);
      setStats(dashboardRes.data);
      setUsers(usersRes.data?.users || []);
      setContent(contentRes.data?.content || []);
      setNews(newsRes.data?.news || []);
      setPendingContent(pendingContentRes.data?.content || []);
      setPendingNews(pendingNewsRes.data?.news || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContent = async (id: string) => {
    try {
      await adminApi.approveContent(id);
      showSuccess('Content approved successfully', 'Approved');
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving content:', error);
      showError('Failed to approve content', 'Error');
    }
  };

  const handleRejectContent = async (id: string, reason?: string) => {
    if (!confirm('Reject this content?')) return;
    try {
      await adminApi.rejectContent(id, reason || 'Rejected by admin');
      showSuccess('Content rejected successfully', 'Rejected');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting content:', error);
      showError('Failed to reject content', 'Error');
    }
  };

  const handleApproveNews = async (id: string) => {
    try {
      await adminApi.approveNews(id);
      showSuccess('News article approved successfully', 'Approved');
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving news:', error);
      showError('Failed to approve news article', 'Error');
    }
  };

  const handlePublishNews = async (id: string) => {
    try {
      await adminApi.publishNews(id);
      showSuccess('News article published successfully', 'Published');
      fetchDashboardData();
    } catch (error) {
      console.error('Error publishing news:', error);
      showError('Failed to publish news article', 'Error');
    }
  };

  const handleRejectNews = async (id: string, reason?: string) => {
    if (!confirm('Reject this news article?')) return;
    try {
      await adminApi.rejectNews(id, reason || 'Rejected by admin');
      showSuccess('News article rejected successfully', 'Rejected');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting news:', error);
      showError('Failed to reject news article', 'Error');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article? This action cannot be undone.')) return;
    try {
      await adminApi.deleteNews(id);
      showSuccess('News article deleted successfully', 'Deleted');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting news:', error);
      showError('Failed to delete news article', 'Error');
    }
  };

  const statCards = [
    {
      icon: FiUsers,
      label: 'Total Users',
      value: stats?.stats?.totalUsers || 0,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      icon: FiCreditCard,
      label: 'Active Subscriptions',
      value: stats?.stats?.activeSubscriptions || 0,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiVideo,
      label: 'Published Content',
      value: stats?.stats?.totalContent || 0,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/content',
    },
    {
      icon: FiFileText,
      label: 'Published News',
      value: stats?.stats?.totalNews || 0,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const pendingCount = (stats?.stats?.pendingContent || 0) + (stats?.stats?.pendingNews || 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'content', label: 'Content', icon: FiVideo },
    { id: 'news', label: 'News', icon: FiFileText },
    { 
      id: 'pending', 
      label: 'Pending Review', 
      icon: FiClock,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-gray-400">Manage platform, users, content, and news</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiRefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {stat.href ? (
              <Link
                href={stat.href}
                className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm flex items-center justify-between">
                  <span>{stat.label}</span>
                  <span className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pending Alerts */}
      {(pendingCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FiClock className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-400">
                {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending review
              </p>
              <p className="text-sm text-yellow-400/70">
                {stats?.stats?.pendingContent || 0} content • {stats?.stats?.pendingNews || 0} news
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pending')}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm font-medium transition-colors"
          >
            Review Now →
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Recent Users */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Users</h3>
                <Link href="/admin/users" className="text-primary-400 hover:text-primary-300 text-sm">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {stats?.recentUsers?.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Content */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Content</h3>
                <Link href="/admin/content" className="text-primary-400 hover:text-primary-300 text-sm">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {stats?.recentContent?.map((item: any) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent News</h3>
                <button
                  onClick={() => setActiveTab('news')}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {stats?.recentNews?.map((item: any) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span className={`capitalize ${
                          item.status === 'published' ? 'text-green-400' :
                          item.status === 'review' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">User Management</h3>
              <Link href="/admin/users" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm">
                Manage All Users
              </Link>
            </div>
            <div className="space-y-3">
              {users.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-xs capitalize ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'creator' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Content Management</h3>
              <Link href="/admin/content" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm">
                Manage All Content
              </Link>
            </div>
            <div className="space-y-4">
              {content.map((item: any) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
                  <img src={item.thumbnail} alt={item.title} className="w-24 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {item.views || 0}
                      </span>
                      <span>•</span>
                      <span className={`capitalize ${
                        item.status === 'approved' ? 'text-green-400' :
                        item.status === 'review' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'review' && (
                      <button
                        onClick={() => handleApproveContent(item._id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      href={`/dashboard/content/${item._id}/edit`}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">News Management</h3>
              <div className="flex gap-2">
                <Link href="/dashboard/news/create" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm">
                  Create News
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {news.map((item: any) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
                  <img 
                    src={item.featuredImage || '/placeholder-news.jpg'} 
                    alt={item.title} 
                    className="w-24 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span>By {item.author?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {item.views || 0}
                      </span>
                      <span>•</span>
                      <span className={`capitalize ${
                        item.status === 'published' ? 'text-green-400' :
                        item.status === 'approved' ? 'text-blue-400' :
                        item.status === 'review' ? 'text-yellow-400' :
                        item.status === 'draft' ? 'text-gray-400' :
                        'text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'review' && (
                      <>
                        <button
                          onClick={() => handleApproveNews(item._id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors flex items-center gap-1"
                          title="Approve"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handlePublishNews(item._id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center gap-1"
                          title="Publish"
                        >
                          <FiGlobe className="w-4 h-4" />
                          Publish
                        </button>
                      </>
                    )}
                    {item.status === 'approved' && (
                      <button
                        onClick={() => handlePublishNews(item._id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center gap-1"
                        title="Publish"
                      >
                        <FiGlobe className="w-4 h-4" />
                        Publish
                      </button>
                    )}
                    <Link
                      href={`/dashboard/news/${item._id}/edit`}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteNews(item._id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {news.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiFileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No news articles found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Pending Content */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Pending Content Review</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                  {pendingContent.length} items
                </span>
              </div>
              <div className="space-y-4">
                {pendingContent.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-yellow-500/20">
                    <img src={item.thumbnail} alt={item.title} className="w-24 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>By {item.createdBy?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveContent(item._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <Link
                        href={`/dashboard/content/${item._id}/edit`}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleRejectContent(item._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingContent.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <FiCheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No content pending review</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending News */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Pending News Review</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                  {pendingNews.length} items
                </span>
              </div>
              <div className="space-y-4">
                {pendingNews.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-yellow-500/20">
                    <img 
                      src={item.featuredImage || '/placeholder-news.jpg'} 
                      alt={item.title} 
                      className="w-24 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>By {item.author?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      {item.excerpt && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.excerpt}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleApproveNews(item._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handlePublishNews(item._id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <FiGlobe className="w-4 h-4" />
                        Publish
                      </button>
                      <Link
                        href={`/dashboard/news/${item._id}/edit`}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleRejectNews(item._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingNews.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <FiCheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No news articles pending review</p>
                  </div>
                )}
              </div>
            </div>

            {pendingContent.length === 0 && pendingNews.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FiCheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">All clear!</p>
                <p className="text-sm mt-1">No items pending review</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
