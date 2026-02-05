import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const WebsitePage = ({ slug }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getWebsitePage(slug)
      .then((data) => {
        if (!cancelled) setPage(data.page);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load page');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  if (error || !page) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Page not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16 md:py-24">
      <article>
        <h1 className="section-heading mb-8">{page.title}</h1>
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight prose-p:leading-relaxed text-gray-600 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: page.body || '' }}
        />
      </article>
    </div>
  );
};

export default WebsitePage;
