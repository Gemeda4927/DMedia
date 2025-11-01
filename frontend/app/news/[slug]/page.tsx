'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { newsApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiEye, FiArrowLeft } from 'react-icons/fi';

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchNews();
    }
  }, [params.slug]);

  const fetchNews = async () => {
    try {
      const response = await newsApi.getBySlug(params.slug as string);
      setNews(response.data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Article not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to News
        </Link>

        {news.isBreaking && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg mb-4 inline-block">
            Breaking News
          </div>
        )}

        <div className="mb-4">
          <span className="text-primary-400 uppercase text-sm">{news.category}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">{news.title}</h1>

        <div className="flex items-center gap-4 text-gray-400 mb-8">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiEye className="w-4 h-4" />
            <span>{news.views} views</span>
          </div>
        </div>

        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <img
            src={news.featuredImage}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="prose prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {news.relatedArticles && news.relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {news.relatedArticles.map((article: any) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition"
                >
                  <div className="relative aspect-video">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

