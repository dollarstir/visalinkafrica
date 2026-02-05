import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Post not found'}</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const imgUrl = getImageUrl(post.featured_image);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-16 md:py-24">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>
      <article>
        <h1 className="section-heading mb-3">{post.title}</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
          {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''}
        </p>
        {imgUrl && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-gray-700">
            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {post.excerpt && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{post.excerpt}</p>
        )}
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight prose-p:leading-relaxed text-gray-600 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.body || '' }}
        />
      </article>
    </div>
  );
};

export default BlogPostPage;
