'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiEye, 
  FiUser,
  FiShare2,
  FiBookmark,
  FiTag,
  FiClock,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiCopy,
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';
import { newsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useNotifications } from '@/lib/notifications';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess } = useNotifications();
  const [news, setNews] = useState<any>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchNews();
      fetchRelatedNews();
    }
  }, [params.slug]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getBySlug(params.slug as string);
      setNews(response.data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const response = await newsApi.getAll({ 
        category: news?.category, 
        limit: 4 
      });
      // Filter out current article
      const related = (response.data?.news || []).filter(
        (item: any) => item.slug !== params.slug
      );
      setRelatedNews(related.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related news:', error);
    }
  };

  useEffect(() => {
    if (news?.category) {
      fetchRelatedNews();
    }
  }, [news?.category]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = news?.title || '';
    const text = news?.excerpt || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        showSuccess('Link copied to clipboard!', 'Copied');
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">📰</div>
          <h2 className="text-3xl font-bold mb-4">Article Not Found</h2>
          <p className="text-gray-400 mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  const dateInfo = formatDate(news.publishedAt || news.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="relative">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to News</span>
          </Link>
        </div>

        {/* Featured Image Hero */}
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={news.featuredImage || 'https://via.placeholder.com/1920x1080'}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/1920x1080';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          </div>

          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-3">
            {news.isBreaking && (
              <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Breaking News
              </span>
            )}
            {news.isFeatured && (
              <span className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Article Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto max-w-4xl">
              <div className="mb-4">
                <span className="inline-block bg-primary-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium uppercase">
                  {news.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {news.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  <span>{news.author?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  <span>{dateInfo.full}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="w-5 h-5" />
                  <span>{news.views || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5" />
                  <span>{dateInfo.relative}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="md:col-span-8">
              {/* Excerpt */}
              {news.excerpt && (
                <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 border-l-4 border-primary-500 p-6 rounded-lg mb-8">
                  <p className="text-xl text-gray-200 leading-relaxed">{news.excerpt}</p>
                </div>
              )}

              {/* Article Content */}
              <div 
                className="prose prose-invert prose-lg max-w-none mb-12
                  prose-headings:text-white prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-bold
                  prose-img:rounded-xl prose-img:my-8
                  prose-blockquote:border-primary-500 prose-blockquote:bg-gray-800/50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-lg
                  prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {news.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:border-primary-500/50 transition-colors cursor-pointer"
                    >
                      <FiTag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-12">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiShare2 className="w-5 h-5" />
                  Share This Article
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <FiFacebook className="w-5 h-5" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
                  >
                    <FiTwitter className="w-5 h-5" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                  >
                    <FiLinkedin className="w-5 h-5" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      copied
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-5 h-5" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Author Card */}
                {news.author && (
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                        {news.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{news.author.name}</p>
                        <p className="text-sm text-gray-400">Author</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Article Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Views</span>
                      <span className="font-semibold">{news.views || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Category</span>
                      <span className="font-semibold capitalize">{news.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Published</span>
                      <span className="font-semibold">{dateInfo.full}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedNews.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Related Articles</h2>
              <Link
                href="/news"
                className="text-primary-400 hover:text-primary-300 flex items-center gap-2"
              >
                View All <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((article: any, index: number) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    href={`/news/${article.slug}`}
                    className="group block bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={article.featuredImage || 'https://via.placeholder.com/800x450'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/800x450';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-block bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium uppercase">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
