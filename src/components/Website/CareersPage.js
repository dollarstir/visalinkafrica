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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading careers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Careers</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-10">Join our team. Explore open positions at VisaLink Africa.</p>
      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No open positions at the moment. Check back later.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                to={`/careers/${job.slug}`}
                className="block p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all"
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
