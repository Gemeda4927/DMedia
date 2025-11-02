'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiEye, 
  FiArrowRight,
  FiTag,
  FiZap,
  FiStar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { newsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface News {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  publishedAt: string;
  createdAt: string;
  views: number;
  isBreaking: boolean;
  isFeatured: boolean;
  author?: {
    name: string;
  };
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: '', label: 'All Categories', icon: FiTag },
    { value: 'politics', label: 'Politics', icon: FiTag },
    { value: 'culture', label: 'Culture', icon: FiTag },
    { value: 'sports', label: 'Sports', icon: FiTag },
    { value: 'entertainment', label: 'Entertainment', icon: FiTag },
    { value: 'economy', label: 'Economy', icon: FiTag },
    { value: 'technology', label: 'Technology', icon: FiTag },
    { value: 'health', label: 'Health', icon: FiTag },
    { value: 'education', label: 'Education', icon: FiTag },
  ];

  useEffect(() => {
    fetchNews();
    fetchFeaturedNews();
  }, [selectedCategory, page, searchQuery]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 12,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await newsApi.getAll(params);
      setNews(response.data.news || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedNews = async () => {
    try {
      const response = await newsApi.getAll({ featured: 'true', limit: 3 });
      setFeaturedNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching featured news:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent">
                News &{' '}
              </span>
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                Stories
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Stay informed with the latest news, stories, and updates from around the world
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news articles..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:outline-none focus:border-primary-500 text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    selectedCategory === cat.value
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:border-primary-500/50'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured News Carousel */}
      {featuredNews.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FiStar className="w-6 h-6 text-yellow-400" />
              <h2 className="text-3xl font-bold">Featured Stories</h2>
            </div>
            <Link
              href="/news?featured=true"
              className="text-primary-400 hover:text-primary-300 flex items-center gap-2"
            >
              View all <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredNews.map((item, index) => (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FiStar className="w-3 h-3" />
                      Featured
                    </span>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium uppercase mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-white font-bold text-xl line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* News Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            {selectedCategory ? (
              <span className="capitalize">{categories.find(c => c.value === selectedCategory)?.label}</span>
            ) : (
              'All News'
            )}
          </h2>
          <div className="flex items-center gap-2 text-gray-400">
            <FiFilter className="w-5 h-5" />
            <span>{news.length} articles</span>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl animate-pulse h-96" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-2xl font-bold mb-2">No news found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {news.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
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
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                          <FiZap className="w-3 h-3" />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-800/50 border border-gray-700/50 hover:border-primary-500/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
