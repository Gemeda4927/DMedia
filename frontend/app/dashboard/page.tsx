'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ViewerDashboard from '@/components/ViewerDashboard';
import CreatorDashboard from '@/components/CreatorDashboard';
import AdminDashboard from '@/components/AdminDashboard';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Determine which dashboard to show based on role
  const renderDashboard = () => {
    if (user?.role === 'admin') {
      return <AdminDashboard user={user} />;
    }
    if (user?.role === 'creator') {
      return <CreatorDashboard user={user} />;
    }
    return <ViewerDashboard user={user} profile={profile} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
}

