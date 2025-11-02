'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiUserPlus, FiArrowRight, FiCheck } from 'react-icons/fi';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength indicators
  const passwordStrength = {
    minLength: formData.password.length >= 6,
    hasNumber: /\d/.test(formData.password),
    hasLetter: /[a-zA-Z]/.test(formData.password),
  };

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const passwordStrengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register(formData);
      setAuth(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.msg || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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
                <FiUserPlus className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-400">Join Dhugaa Media and start your journey</p>
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
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                    focusedField === 'name' ? 'text-primary-400' : 'text-gray-500'
                  }`}>
                    <FiUser className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setError('');
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-900/50 border ${
                      focusedField === 'name' 
                        ? 'border-primary-500' 
                        : error && formData.name === ''
                        ? 'border-red-500'
                        : 'border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-gray-500`}
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => {
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrengthScore
                              ? passwordStrengthColors[passwordStrengthScore - 1]
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${
                        passwordStrength.minLength ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        <FiCheck className={`w-3 h-3 ${passwordStrength.minLength ? 'opacity-100' : 'opacity-0'}`} />
                        <span>6+ chars</span>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        <FiCheck className={`w-3 h-3 ${passwordStrength.hasNumber ? 'opacity-100' : 'opacity-0'}`} />
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        passwordStrength.hasLetter ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        <FiCheck className={`w-3 h-3 ${passwordStrength.hasLetter ? 'opacity-100' : 'opacity-0'}`} />
                        <span>Letter</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Sign in
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
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

