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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 md:py-24">
      <h1 className="section-heading mb-2">Blog</h1>
      <p className="section-subheading mb-12 text-left max-w-none">News and updates from VisaLink Africa.</p>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const imgUrl = getImageUrl(post.featured_image);
            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block rounded-2xl overflow-hidden border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-card hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300"
              >
                {imgUrl && (
                  <div className="aspect-video bg-slate-100 dark:bg-gray-700 overflow-hidden">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{post.excerpt}</p>
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
