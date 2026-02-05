import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { MapPin, Briefcase, Calendar } from 'lucide-react';

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiService.getJobPosts({ page: 1, limit: 20 })
      .then((data) => {
        if (!cancelled) {
          setJobs(data.jobs || []);
          setPagination(data.pagination || { page: 1, pages: 1 });
        }
      })
      .catch(() => { if (!cancelled) setJobs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading careers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16 md:py-24">
      <h1 className="section-heading mb-2">Careers</h1>
      <p className="section-subheading mb-10 text-left max-w-none">Join our team. Explore open positions at VisaLink Africa.</p>
      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 font-medium">No open positions at the moment. Check back later.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                to={`/careers/${job.slug}`}
                className="block p-6 rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card transition-all duration-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                  {job.title}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
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
                  {job.employment_type && (
                    <span>{job.employment_type}</span>
                  )}
                  {job.application_deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Apply by {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CareersPage;
