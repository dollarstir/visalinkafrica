import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import { MapPin, Briefcase, Calendar, Send, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '../../utils/toast';

const JobPostPage = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState({ applicant_name: '', applicant_email: '', applicant_phone: '', cover_letter: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [applied, setApplied] = useState(false);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Job not found'}</p>
        <Link to="/careers" className="mt-4 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Careers
        </Link>
      </div>
    );
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.applicant_name?.trim() || !applyForm.applicant_email?.trim()) {
      showError('Name and email are required');
      return;
    }
    try {
      setSubmitting(true);
      await apiService.submitJobApplication(job.id, applyForm, resumeFile);
      showSuccess('Application submitted successfully. We will be in touch.');
      setApplied(true);
      setApplyForm({ applicant_name: '', applicant_email: '', applicant_phone: '', cover_letter: '' });
      setResumeFile(null);
      setApplyOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-16 md:py-24">
      <Link to="/careers" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Careers
      </Link>
      <article>
        <h1 className="section-heading mb-4">{job.title}</h1>
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
          <div className="p-6 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">How to apply</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.how_to_apply}
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-soft">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Apply for this position</h2>
          {applied ? (
            <p className="text-green-600 dark:text-green-400 font-medium">Your application has been submitted. We will contact you soon.</p>
          ) : !applyOpen ? (
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Apply now
            </button>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name *</label>
                <input
                  type="text"
                  required
                  value={applyForm.applicant_name}
                  onChange={(e) => setApplyForm((p) => ({ ...p, applicant_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={applyForm.applicant_email}
                  onChange={(e) => setApplyForm((p) => ({ ...p, applicant_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={applyForm.applicant_phone}
                  onChange={(e) => setApplyForm((p) => ({ ...p, applicant_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover letter</label>
                <textarea
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm((p) => ({ ...p, cover_letter: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us why you're a good fit..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume (PDF or Word)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
                <button type="button" onClick={() => setApplyOpen(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </article>
    </div>
  );
};

export default JobPostPage;
