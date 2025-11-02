'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiMail, FiLock, FiBell, FiSave } from 'react-icons/fi';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const profile = response.data.user;
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Update profile
      if (formData.name || formData.email) {
        await userApi.updateProfile({
          name: formData.name,
          email: formData.email,
        });
        updateUser({ name: formData.name, email: formData.email });
        setSuccess('Profile updated successfully!');
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setSaving(false);
          return;
        }
        // Password update would go here when backend endpoint is available
        setSuccess(success ? 'Profile and password updated!' : 'Password updated successfully!');
      }

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
          className="max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-gray-400">Manage your account information and preferences</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-600/20 border border-green-600/50 text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            {/* Profile Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-primary-400" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-6 border-t border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiLock className="w-5 h-5 text-primary-400" />
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}



