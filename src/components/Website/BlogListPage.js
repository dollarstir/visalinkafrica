import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  try {
    return new URL(apiService.baseURL).origin + url;
  } catch {
    return window.location.origin + url;
  }
};

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiService.getBlogPosts({ page: 1, limit: 12 })
      .then((data) => {
        if (!cancelled) {
          setPosts(data.posts || []);
          setPagination(data.pagination || { page: 1, pages: 1 });
        }
      })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Blog</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-10">News and updates from VisaLink Africa.</p>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const imgUrl = getImageUrl(post.featured_image);
            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                {imgUrl && (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {pagination.pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <span key={p} className="text-gray-600 dark:text-gray-400">
              {p === pagination.page ? `Page ${p}` : `Page ${p}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
