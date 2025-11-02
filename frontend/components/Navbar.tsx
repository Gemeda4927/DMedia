'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiHome,
  FiVideo,
  FiBookOpen,
  FiCreditCard,
  FiChevronDown,
  FiHeart,
  FiClock,
  FiStar,
  FiShield,
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { notificationApi, contentApi, newsApi } from '@/lib/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getAll({ limit: 10, unreadOnly: false });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const [contentRes, newsRes] = await Promise.all([
        contentApi.getAll({ search: query, limit: 5 }).catch(() => ({ data: [] })),
        newsApi.getAll({ search: query, limit: 5 }).catch(() => ({ data: [] })),
      ]);

      const results = [
        ...(contentRes.data?.content || []).map((item: any) => ({
          ...item,
          type: 'content',
          title: item.title,
          url: `/content/${item._id}`,
        })),
        ...(newsRes.data?.news || []).map((item: any) => ({
          ...item,
          type: 'news',
          title: item.title,
          url: `/news/${item.slug}`,
        })),
      ];

      setSearchResults(results.slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/content', label: 'Content', icon: FiVideo },
    { href: '/news', label: 'News', icon: FiBookOpen },
    { href: '/subscriptions', label: 'Subscriptions', icon: FiCreditCard },
  ];

  const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FiUser },
    { href: '/dashboard/bookmarks', label: 'My Bookmarks', icon: FiHeart },
    { href: '/dashboard/history', label: 'Watch History', icon: FiClock },
    { href: '/subscriptions', label: 'Subscription', icon: FiStar },
    { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  ];

  if (user?.role === 'admin') {
    userMenuItems.push({ href: '/admin', label: 'Admin Panel', icon: FiShield });
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-lg">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <Link
              href="/"
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent hover:from-primary-300 hover:to-primary-500 transition-all"
            >
              Dhugaa Media
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-300 hover:text-primary-400 hover:bg-gray-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 rounded-lg transition-all"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <input
                        type="text"
                        placeholder="Search content, news..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                        autoFocus
                      />
                    </div>
                    {searchLoading && (
                      <div className="p-8 text-center text-gray-400">Searching...</div>
                    )}
                    {!searchLoading && searchResults.length > 0 && (
                      <div className="max-h-96 overflow-y-auto">
                        {searchResults.map((result) => (
                          <Link
                            key={result._id || result.id}
                            href={result.url}
                            onClick={() => setSearchOpen(false)}
                            className="block px-4 py-3 hover:bg-gray-700/50 border-b border-gray-700/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                                {result.type === 'content' ? (
                                  <FiVideo className="w-5 h-5 text-white" />
                                ) : (
                                  <FiBookOpen className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{result.title}</p>
                                <p className="text-gray-400 text-sm capitalize">{result.type}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {!searchLoading && searchQuery && searchResults.length === 0 && (
                      <div className="p-8 text-center text-gray-400">No results found</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications - Only for authenticated users */}
            {isAuthenticated && (
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 rounded-lg transition-all"
                  aria-label="Notifications"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await notificationApi.markAllAsRead();
                                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                                setUnreadCount(0);
                              } catch (error) {
                                console.error('Error marking all as read:', error);
                              }
                            }}
                            className="text-xs text-primary-400 hover:text-primary-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">No notifications</div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => markNotificationAsRead(notification._id)}
                              className={`px-4 py-3 hover:bg-gray-700/50 border-b border-gray-700/50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-gray-700/30' : ''
                              }`}
                            >
                              <p className="text-white font-medium text-sm">{notification.title}</p>
                              <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Auth Buttons / User Menu */}
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-300 hover:text-primary-400 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg transition-all shadow-lg shadow-primary-500/20 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-gray-300 font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-white font-semibold">{user?.name}</p>
                        <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                        {user?.subscriptionTier && (
                          <span className="inline-block mt-2 px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded capitalize">
                            {user.subscriptionTier}
                          </span>
                        )}
                      </div>
                      <div className="py-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 space-y-2 border-t border-gray-800 pt-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    pathname === link.href
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-300 hover:text-primary-400 hover:bg-gray-800/50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 transition-all"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium"
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <div className="pt-4 border-t border-gray-800">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
