'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { contentApi } from '@/lib/api';

interface Content {
  _id: string;
  title: string;
  thumbnail: string;
  type: string;
  category: string;
  views: number;
  rating: { average: number };
  isPremium: boolean;
}

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });

  useEffect(() => {
    fetchContent();
  }, [filters]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getAll(filters);
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Browse Content</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="show">Shows</option>
            <option value="podcast">Podcasts</option>
            <option value="live">Live</option>
          </select>
          
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

          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg flex-1 min-w-[200px]"
          />
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : content.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No content found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.map((item) => (
              <Link
                key={item._id}
                href={`/content/${item._id}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition transform"
              >
                <div className="relative aspect-video">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.isPremium && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">
                      Premium
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{item.type}</span>
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

