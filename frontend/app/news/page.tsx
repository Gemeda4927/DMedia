'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { newsApi } from '@/lib/api';

interface News {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  publishedAt: string;
  views: number;
  isBreaking: boolean;
  isFeatured: boolean;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', featured: '', breaking: '' });

  useEffect(() => {
    fetchNews();
  }, [filters]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getAll(filters);
      setNews(response.data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">News & Articles</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="politics">Politics</option>
            <option value="culture">Culture</option>
            <option value="sports">Sports</option>
            <option value="entertainment">Entertainment</option>
          </select>
          
          <button
            onClick={() => setFilters({ ...filters, breaking: filters.breaking === 'true' ? '' : 'true' })}
            className={`px-4 py-2 rounded-lg ${
              filters.breaking === 'true' 
                ? 'bg-red-600' 
                : 'bg-gray-800 border border-gray-700'
            }`}
          >
            Breaking News
          </button>

          <button
            onClick={() => setFilters({ ...filters, featured: filters.featured === 'true' ? '' : 'true' })}
            className={`px-4 py-2 rounded-lg ${
              filters.featured === 'true' 
                ? 'bg-primary-600' 
                : 'bg-gray-800 border border-gray-700'
            }`}
          >
            Featured
          </button>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No news found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link
                key={item._id}
                href={`/news/${item.slug}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition transform"
              >
                <div className="relative aspect-video">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.isBreaking && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">
                      Breaking
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-primary-400 text-sm uppercase">{item.category}</span>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 mt-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    <span>{item.views} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

