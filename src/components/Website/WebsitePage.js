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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  if (error || !page) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-600 dark:text-red-400">{error || 'Page not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">{page.title}</h1>
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: page.body || '' }}
        />
      </article>
    </div>
  );
};

export default WebsitePage;
