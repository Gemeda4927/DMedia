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
} from 'react-icons/fi';
import { adminApi } from '@/lib/api';

interface AdminDashboardProps {
  user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [pendingContent, setPendingContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'pending'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, usersRes, contentRes, pendingRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers({ limit: 10 }),
        adminApi.getContent({ limit: 10 }),
        adminApi.getContent({ status: 'review', limit: 10 }),
      ]);
      setStats(dashboardRes.data);
      setUsers(usersRes.data?.users || []);
      setContent(contentRes.data?.content || []);
      setPendingContent(pendingRes.data?.content || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContent = async (id: string) => {
    try {
      await adminApi.approveContent(id);
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving content:', error);
      alert('Failed to approve content');
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
      label: 'News Articles',
      value: stats?.stats?.totalNews || 0,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'content', label: 'Content', icon: FiVideo },
    { id: 'pending', label: 'Pending Review', icon: FiClock },
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
          <p className="text-gray-400">Manage platform, users, and content</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
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

        {activeTab === 'pending' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Pending Review</h3>
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
                      onClick={async () => {
                        if (confirm('Reject this content?')) {
                          try {
                            await adminApi.rejectContent(item._id, 'Rejected by admin');
                            fetchDashboardData();
                          } catch (error) {
                            alert('Failed to reject content');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingContent.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiCheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No content pending review. All clear!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

