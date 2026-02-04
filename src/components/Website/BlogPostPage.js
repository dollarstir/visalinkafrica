import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    apiService.getBlogPost(slug)
      .then((data) => { if (!cancelled) setPost(data.post); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Post not found'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-600 dark:text-red-400">{error || 'Post not found'}</p>
        <Link to="/blog" className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:underline">Back to Blog</Link>
      </div>
    );
  }

  const imgUrl = getImageUrl(post.featured_image);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Link to="/blog" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mb-6 inline-block">
        ← Back to Blog
      </Link>
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''}
        </p>
        {imgUrl && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-200 dark:bg-gray-700">
            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {post.excerpt && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{post.excerpt}</p>
        )}
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.body || '' }}
        />
      </article>
    </div>
  );
};

export default BlogPostPage;
