'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiPlay, 
  FiBookmark, 
  FiTrendingUp, 
  FiMonitor, 
  FiZap, 
  FiShield,
  FiGlobe,
  FiStar,
  FiChevronRight,
  FiArrowRight,
  FiClock,
  FiEye,
  FiCalendar
} from 'react-icons/fi'
import Navbar from '@/components/Navbar'
import { newsApi } from '@/lib/api'

export default function Home() {
  const [featuredNews, setFeaturedNews] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const [featuredRes, breakingRes] = await Promise.all([
        newsApi.getAll({ featured: 'true', limit: 6 }),
        newsApi.getAll({ breaking: 'true', limit: 3 })
      ]);
      setFeaturedNews(featuredRes.data?.news || []);
      setBreakingNews(breakingRes.data?.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const features = [
    {
      icon: FiMonitor,
      title: 'Premium Content',
      description: 'Access high-quality shows, documentaries, and entertainment in stunning HD quality',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: FiBookmark,
      title: 'Latest News',
      description: 'Stay informed with breaking news and stories from the Oromo community worldwide',
      color: 'from-accent-500 to-accent-600'
    },
    {
      icon: FiTrendingUp,
      title: 'Multiple Tiers',
      description: 'Choose from Free, Premium, Pro, or Enterprise plans tailored to your needs',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Enjoy seamless streaming with ultra-fast load times and buffer-free playback',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FiGlobe,
      title: 'Global Access',
      description: 'Watch and read content from anywhere in the world, anytime you want',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'Your data and privacy are protected with enterprise-grade security measures',
      color: 'from-red-500 to-red-600'
    }
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500+', label: 'Premium Shows' },
    { value: '1K+', label: 'News Articles' },
    { value: '24/7', label: 'Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-gray-900 to-purple-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-block px-4 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-6">
                🎬 Your Premier Oromo Content Platform
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent">
                Welcome to{' '}
              </span>
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                Dhugaa Media
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Your premier destination for authentic Oromo content. Watch shows, read news, and stay connected with your culture.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link 
                href="/register" 
                className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-xl text-lg font-semibold transition-all flex items-center gap-2 shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                <FiPlay className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Get Started Free
                <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/content" 
                className="px-8 py-4 border-2 border-gray-700 hover:border-primary-500 rounded-xl text-lg font-semibold transition-all hover:bg-gray-800/50 hover:scale-105"
              >
                Browse Content
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <section className="relative py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-600 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg shrink-0">
                <span className="animate-pulse text-white font-bold text-sm flex items-center gap-1">
                  <span>🔥</span> BREAKING
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-8">
                  {breakingNews.slice(0, 1).map((news: any) => (
                    <Link
                      key={news._id}
                      href={`/news/${news.slug}`}
                      className="flex items-center gap-4 text-white hover:text-yellow-200 transition-colors"
                    >
                      <span className="font-semibold text-sm md:text-base truncate">
                        {news.title}
                      </span>
                      <span className="text-xs opacity-75 shrink-0">
                        {new Date(news.publishedAt || news.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/news?breaking=true"
                className="text-white hover:text-yellow-200 transition-colors whitespace-nowrap text-sm font-medium flex items-center gap-1 shrink-0"
              >
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <section className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    Featured News
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  Stay informed with the latest stories and updates
                </p>
              </div>
              <Link
                href="/news"
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                View All News
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl animate-pulse h-96" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredNews.slice(0, 6).map((item: any, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Link
                      href={`/news/${item.slug}`}
                      className="group block bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={item.featuredImage || 'https://via.placeholder.com/800x450'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/800x450';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {item.isBreaking && (
                          <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            Breaking
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiEye className="w-3 h-3" />
                              <span>{item.views || 0} views</span>
                            </div>
                          </div>
                          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Dhugaa Media</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the best in Oromo entertainment and news with cutting-edge features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl hover:border-primary-500/50 transition-all overflow-hidden"
            >
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials/CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-purple-900/30 to-primary-900/30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 md:p-16"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Thousands of Happy Users
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              "Dhugaa Media has brought our community together like never before. The quality of content and ease of access is unmatched."
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-xl text-lg font-semibold transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
            >
              Start Your Journey Today
              <FiChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
                Dhugaa Media
              </h3>
              <p className="text-gray-400">
                Your premier destination for authentic Oromo content and culture.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/content" className="hover:text-primary-400 transition">Content</Link></li>
                <li><Link href="/news" className="hover:text-primary-400 transition">News</Link></li>
                <li><Link href="/subscriptions" className="hover:text-primary-400 transition">Subscriptions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-primary-400 transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary-400 transition">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-primary-400 transition">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-primary-400 transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-400 transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2024 Dhugaa Media. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Made with</span>
              <span className="text-red-500">♥</span>
              <span className="text-gray-400">for the Oromo community</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

