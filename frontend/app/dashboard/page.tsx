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
import SubscriberDashboard from '@/components/SubscriberDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, token, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchProfile = async () => {
    console.log('🟡 [DASHBOARD] Fetching profile...');
    
    // Verify token exists before making request
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.log('🔴 [DASHBOARD] No token found, redirecting to login');
      router.replace('/login');
      setLoading(false);
      return;
    }
    
    console.log('🟡 [DASHBOARD] Token exists, making API call...');
    
    let errorOccurred = false;
    let is401Error = false;
    
    try {
      const response = await userApi.getProfile();
      console.log('✅ [DASHBOARD] Profile fetched successfully');
      const profileData = response.data.user;
      setProfile(profileData);
      
      // Update user state with latest profile data to ensure role is current
      if (profileData) {
        console.log('🟡 [DASHBOARD] Updating user state:', {
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
    } catch (error: any) {
      errorOccurred = true;
      is401Error = error.response?.status === 401;
      
      console.error('🔴 [DASHBOARD] Error fetching profile:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
      // If 401, logout will be handled by interceptor
      if (is401Error) {
        console.log('🔴 [DASHBOARD] 401 error - auth will be cleared by interceptor');
        // Don't set loading to false here, let interceptor handle redirect
      } else {
        // Other errors, just show loading complete
        console.log('🟡 [DASHBOARD] Non-401 error, showing dashboard');
        setLoading(false);
      }
    } finally {
      // Only set loading to false if not a 401
      if (!errorOccurred || !is401Error) {
        setLoading(false);
      }
    }
  };

  // Check auth status after mount - only once
  useEffect(() => {
    // Wait for Zustand to hydrate
    const checkAuth = async () => {
      // Wait a bit for Zustand hydration
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
      const hasAuth = isAuthenticated || token || storedToken || storedUser;
      
      if (!hasAuth) {
        // No auth, redirect to login
        router.replace('/login');
        return;
      }

      // Has auth, fetch profile
      setAuthChecked(true);
      fetchProfile();
    };

    checkAuth();
  }, []); // Only run once on mount

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      router.push('/login');
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [router]);

  // Show loading while checking auth or fetching profile
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

  // Determine which dashboard to show based on role
  const renderDashboard = () => {
    const userRole = user?.role || profile?.role;
    
    if (userRole === 'admin') {
      return <AdminDashboard user={user || profile} />;
    }
    if (userRole === 'creator') {
      return <CreatorDashboard user={user || profile} />;
    }
    if (userRole === 'subscriber') {
      return <SubscriberDashboard user={user || profile} profile={profile} />;
    }
    // Default to viewer dashboard for 'viewer' role and fallback
    return <ViewerDashboard user={user || profile} profile={profile} />;
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

