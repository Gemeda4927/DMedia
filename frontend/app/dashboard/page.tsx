'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import Link from 'next/link';
import { FiUser, FiBookmark, FiClock, FiSettings } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <FiUser className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Profile</h3>
            <p className="text-gray-400">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiBookmark className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold">
                {profile?.bookmarks?.length || 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Bookmarks</h3>
            <Link href="/dashboard/bookmarks" className="text-primary-400 hover:text-primary-300">
              View all →
            </Link>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiClock className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold">
                {profile?.watchHistory?.length || 0}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Watch History</h3>
            <Link href="/dashboard/history" className="text-primary-400 hover:text-primary-300">
              View all →
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg capitalize">{user?.subscriptionTier || 'free'} Plan</p>
              <p className="text-gray-400">Current subscription status</p>
            </div>
            <Link
              href="/subscriptions"
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg"
            >
              Manage Subscription
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/content"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Browse Content</h3>
            <p className="text-gray-400">Discover new shows and media</p>
          </Link>

          <Link
            href="/news"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Read News</h3>
            <p className="text-gray-400">Stay updated with latest articles</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

