'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn, FiArrowRight } from 'react-icons/fi';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, token } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Log component mount and auth state
  useEffect(() => {
    console.log('🔵 [LOGIN] Component mounting...');
    console.log('🔵 [LOGIN] Initial auth state:', { isAuthenticated, token: token ? '***exists***' : null });
    
    // Check localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedAuth = localStorage.getItem('auth-storage');
      console.log('🔵 [LOGIN] localStorage state:', {
        token: storedToken ? '***exists***' : null,
        authStorage: storedAuth ? '***exists***' : null
      });
    }
    
    setMounted(true);
    console.log('🔵 [LOGIN] Component mounted');
    
    return () => {
      console.log('🔵 [LOGIN] Component unmounting...');
    };
  }, []);
  
  // Log auth state changes
  useEffect(() => {
    console.log('🔵 [LOGIN] Auth state changed:', { isAuthenticated, token: token ? '***exists***' : null });
  }, [isAuthenticated, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🟢 [LOGIN] Form submitted');
    console.log('🟢 [LOGIN] Form data:', { email: formData.email, password: '***' });
    
    setError('');
    
    // Validation
    console.log('🟡 [LOGIN] Starting validation...');
    if (!formData.email || !formData.password) {
      console.log('🔴 [LOGIN] Validation failed: Missing fields');
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      console.log('🔴 [LOGIN] Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return;
    }

    console.log('✅ [LOGIN] Validation passed');
    console.log('🟡 [LOGIN] Setting loading state...');
    setLoading(true);

    try {
      console.log('🟡 [LOGIN] Making API call to /auth/login...');
      console.log('🟡 [LOGIN] Request payload:', { email: formData.email, password: '***' });
      
      const response = await authApi.login(formData);
      console.log('✅ [LOGIN] API call successful');
      console.log('✅ [LOGIN] Response data:', {
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        userRole: response.data.user?.role,
        userId: response.data.user?.id,
        userName: response.data.user?.name
      });
      
      if (response.data.user && response.data.token) {
        console.log('🟡 [LOGIN] Setting auth state in Zustand store...');
        
        // Check state before setting
        console.log('🟡 [LOGIN] Auth state BEFORE setAuth:', {
          isAuthenticated,
          token: token ? '***exists***' : null,
          user: useAuthStore.getState().user
        });
        
        // Set auth state
        setAuth(response.data.user, response.data.token);
        
        // Check state immediately after setting
        const stateAfterSet = useAuthStore.getState();
        console.log('🟡 [LOGIN] Auth state AFTER setAuth:', {
          isAuthenticated: stateAfterSet.isAuthenticated,
          token: stateAfterSet.token ? '***exists***' : null,
          user: stateAfterSet.user
        });
        
        // Check localStorage after setting
        if (typeof window !== 'undefined') {
          const tokenAfterSet = localStorage.getItem('token');
          const authStorageAfterSet = localStorage.getItem('auth-storage');
          console.log('🟡 [LOGIN] localStorage AFTER setAuth:', {
            token: tokenAfterSet ? '***exists***' : null,
            authStorage: authStorageAfterSet ? '***exists***' : null
          });
        }
        
        console.log('🟡 [LOGIN] Waiting 500ms for state persistence...');
        // Wait longer for state to persist and update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check state after waiting
        const stateAfterWait = useAuthStore.getState();
        console.log('🟡 [LOGIN] Auth state AFTER wait:', {
          isAuthenticated: stateAfterWait.isAuthenticated,
          token: stateAfterWait.token ? '***exists***' : null,
          user: stateAfterWait.user
        });
        
        if (typeof window !== 'undefined') {
          const tokenAfterWait = localStorage.getItem('token');
          const authStorageAfterWait = localStorage.getItem('auth-storage');
          console.log('🟡 [LOGIN] localStorage AFTER wait:', {
            token: tokenAfterWait ? '***exists***' : null,
            authStorage: authStorageAfterWait ? '***exists***' : null
          });
          
          // Verify token is actually stored
          if (!tokenAfterWait) {
            console.error('🔴 [LOGIN] CRITICAL: Token not found in localStorage after wait!');
            setError('Failed to save authentication. Please try again.');
            setLoading(false);
            return;
          }
          
          // Verify auth storage contains user
          if (authStorageAfterWait) {
            try {
              const parsed = JSON.parse(authStorageAfterWait);
              if (!parsed.state?.user || !parsed.state?.token) {
                console.error('🔴 [LOGIN] CRITICAL: User or token missing from auth-storage!');
                setError('Failed to save authentication. Please try again.');
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error('🔴 [LOGIN] CRITICAL: Failed to parse auth-storage!', e);
            }
          }
        }
        
        // Redirect based on user role
        const userRole = response.data.user?.role;
        let redirectPath = '/dashboard';
        
        if (userRole === 'admin') {
          redirectPath = '/admin';
        } else if (userRole === 'creator' || userRole === 'subscriber' || userRole === 'viewer') {
          redirectPath = '/dashboard';
        }
        
        console.log('🟢 [LOGIN] Determining redirect path...');
        console.log('🟢 [LOGIN] User role:', userRole);
        console.log('🟢 [LOGIN] Redirect path:', redirectPath);
        
        // Use window.location for a full page navigation to ensure clean state
        console.log('🟢 [LOGIN] Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      } else {
        console.log('🔴 [LOGIN] Invalid response: Missing user or token');
        console.log('🔴 [LOGIN] Response:', response.data);
        setError('Invalid response from server');
        setLoading(false);
      }
    } catch (err: any) {
      console.log('🔴 [LOGIN] API call failed');
      console.log('🔴 [LOGIN] Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config ? { url: err.config.url, method: err.config.method } : null
      });
      
      setLoading(false);
      // Don't show error if it's a 401 redirect (handled by interceptor)
      if (err.response?.status !== 401) {
        const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed. Please check your credentials.';
        console.log('🔴 [LOGIN] Setting error message:', errorMessage);
        setError(errorMessage);
      } else {
        console.log('🟡 [LOGIN] 401 error - skipping error message (handled by interceptor)');
      }
    }
  };

  // Show loading while mounting
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navbar />
      
      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30"
              >
                <FiLogIn className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-400">Sign in to continue to Dhugaa Media</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <FiLock className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                    focusedField === 'email' ? 'text-primary-400' : 'text-gray-500'
                  }`}>
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      console.log('🔵 [LOGIN] Email field changed:', e.target.value);
                      setFormData({ ...formData, email: e.target.value });
                      setError('');
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-900/50 border ${
                      focusedField === 'email' 
                        ? 'border-primary-500' 
                        : error && formData.email === ''
                        ? 'border-red-500'
                        : 'border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-gray-500`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                    focusedField === 'password' ? 'text-primary-400' : 'text-gray-500'
                  }`}>
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      console.log('🔵 [LOGIN] Password field changed:', e.target.value.length, 'characters');
                      setFormData({ ...formData, password: e.target.value });
                      setError('');
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-900/50 border ${
                      focusedField === 'password' 
                        ? 'border-primary-500' 
                        : error && formData.password === ''
                        ? 'border-red-500'
                        : 'border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-gray-500`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔵 [LOGIN] Toggle password visibility:', !showPassword);
                      setShowPassword(!showPassword);
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Sign up
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-gray-500"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

