'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { FiUsers, FiVideo, FiFileText, FiCreditCard } from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboard();
  }, [isAuthenticated, user, router]);

  const fetchDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiUsers className="w-8 h-8 text-primary-500" />
              <span className="text-3xl font-bold">{stats?.stats?.totalUsers || 0}</span>
            </div>
            <h3 className="text-lg font-semibold">Total Users</h3>
            <Link href="/admin/users" className="text-primary-400 hover:text-primary-300 text-sm">
              View all →
            </Link>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiCreditCard className="w-8 h-8 text-primary-500" />
              <span className="text-3xl font-bold">{stats?.stats?.activeSubscriptions || 0}</span>
            </div>
            <h3 className="text-lg font-semibold">Active Subscriptions</h3>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiVideo className="w-8 h-8 text-primary-500" />
              <span className="text-3xl font-bold">{stats?.stats?.totalContent || 0}</span>
            </div>
            <h3 className="text-lg font-semibold">Published Content</h3>
            <Link href="/admin/content" className="text-primary-400 hover:text-primary-300 text-sm">
              Manage →
            </Link>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiFileText className="w-8 h-8 text-primary-500" />
              <span className="text-3xl font-bold">{stats?.stats?.totalNews || 0}</span>
            </div>
            <h3 className="text-lg font-semibold">News Articles</h3>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {stats?.recentUsers?.map((user: any) => (
                <div key={user._id} className="flex justify-between items-center">
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

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
            <div className="space-y-3">
              {stats?.recentContent?.map((content: any) => (
                <div key={content._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{content.title}</p>
                    <p className="text-sm text-gray-400 capitalize">{content.type}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

