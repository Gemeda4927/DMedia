'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      // Wait for Zustand to hydrate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check multiple sources for auth state
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
      
      // Parse stored auth to check if user exists
      let storedUser = null;
      try {
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          storedUser = parsed.state?.user;
        }
      } catch (e) {
        // Ignore parse errors
      }
      
      // Check if we have any indication of authentication
      const hasAuth = isAuthenticated || storedToken || storedUser;
      
      if (!hasAuth) {
        router.push('/login');
        return;
      }

      // Verify token exists before making request
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.log('🔴 [ADMIN] No token found, redirecting to login');
        router.push('/login');
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      console.log('🟡 [ADMIN] Token exists, fetching profile...');
      
      // Fetch profile to get latest role
      try {
        const response = await userApi.getProfile();
        console.log('✅ [ADMIN] Profile fetched successfully');
        const profileData = response.data.user;
        setProfile(profileData);

        // Update user state
        if (profileData) {
          console.log('🟡 [ADMIN] Updating user state:', {
            id: profileData._id || profileData.id,
            role: profileData.role
          });
          updateUser({
            id: profileData._id || profileData.id,
            email: profileData.email,
            name: profileData.name,
            role: profileData.role,
            subscriptionTier: profileData.subscriptionTier,
          });
        }

        // Check if user is admin
        if (profileData?.role !== 'admin' && user?.role !== 'admin') {
          console.log('🟡 [ADMIN] User is not admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        console.log('✅ [ADMIN] User is admin, showing admin dashboard');
      } catch (error: any) {
        console.error('🔴 [ADMIN] Error fetching profile:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          url: error.config?.url
        });
        
        if (error.response?.status === 401) {
          console.log('🔴 [ADMIN] 401 error - redirecting to login');
          router.push('/login');
          return;
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthAndFetchProfile();
  }, [isAuthenticated, user, router, updateUser]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const userRole = user?.role || profile?.role;
  
  if (userRole !== 'admin') {
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
        <AdminDashboard user={user || profile} />
      </div>
    </div>
  );
}

