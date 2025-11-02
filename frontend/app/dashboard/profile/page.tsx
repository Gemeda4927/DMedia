'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiStar, FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
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
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-3xl">
                  {profile?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile?.name || user?.name || 'User'}</h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      {profile?.email || user?.email}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FiEdit className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {profile?.role && (
                <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-lg text-sm font-medium capitalize">
                  {profile.role}
                </span>
              )}
              {profile?.subscriptionTier && (
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium capitalize">
                  {profile.subscriptionTier} Plan
                </span>
              )}
              {profile?.createdAt && (
                <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Member since {new Date(profile.createdAt).getFullYear()}
                </span>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Bookmarks</span>
                <FiStar className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold">{profile?.bookmarks?.length || 0}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Watch History</span>
                <FiCalendar className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{profile?.watchHistory?.length || 0}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Account Status</span>
                <FiUser className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-lg font-semibold text-green-400">Active</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/bookmarks"
                className="p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <h3 className="font-medium mb-1">My Bookmarks</h3>
                <p className="text-sm text-gray-400">View your saved content</p>
              </Link>
              <Link
                href="/dashboard/history"
                className="p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <h3 className="font-medium mb-1">Watch History</h3>
                <p className="text-sm text-gray-400">Continue watching</p>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}




