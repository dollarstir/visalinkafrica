import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import { MapPin, Briefcase, Calendar } from 'lucide-react';

const JobPostPage = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    apiService.getJobPost(slug)
      .then((data) => { if (!cancelled) setJob(data.job); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Job not found'); })
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

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-600 dark:text-red-400">{error || 'Job not found'}</p>
        <Link to="/careers" className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:underline">Back to Careers</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Link to="/careers" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mb-6 inline-block">
        ← Back to Careers
      </Link>
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{job.title}</h1>
        <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
          {job.department && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {job.department}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          )}
          {job.employment_type && <span>{job.employment_type}</span>}
          {job.application_deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Apply by {new Date(job.application_deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        {job.description && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>
        )}
        {job.requirements && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Requirements</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.requirements}
            </div>
          </div>
        )}
        {job.how_to_apply && (
          <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How to apply</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.how_to_apply}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default JobPostPage;
