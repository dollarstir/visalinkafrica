import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const getResumeUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = (() => {
    try { return new URL(apiService.baseURL).origin; } catch { return window.location.origin; }
  })();
  return base + path;
};

const JobApplicationsList = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailApp, setDetailApp] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notesUpdate, setNotesUpdate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [pagination.page, jobFilter, statusFilter]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await apiService.getJobPostsAll();
      setJobs(data.jobs || []);
    } catch (err) {
      showError(err.message || 'Failed to load jobs');
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (jobFilter) params.job_id = jobFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await apiService.getJobApplications(params);
      setApplications(data.applications || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      showError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (app) => {
    setSelectedApp(app);
    setLoadingDetail(true);
    setDetailApp(null);
    setStatusUpdate(app.status || '');
    setNotesUpdate(app.admin_notes || '');
    try {
      const data = await apiService.getJobApplication(app.id);
      setDetailApp(data.application);
      setStatusUpdate(data.application.status || '');
      setNotesUpdate(data.application.admin_notes || '');
    } catch (err) {
      showError(err.message || 'Failed to load application');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedApp(null);
    setDetailApp(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedApp) return;
    try {
      setSaving(true);
      await apiService.updateJobApplication(selectedApp.id, {
        status: statusUpdate,
        admin_notes: notesUpdate,
      });
      showSuccess('Application updated');
      loadApplications();
      if (detailApp) setDetailApp({ ...detailApp, status: statusUpdate, admin_notes: notesUpdate });
    } catch (err) {
      showError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission(user, 'job_applications.view') && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job applications</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage applications submitted for career positions.</p>
      </div>

      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
          <select
            value={jobFilter}
            onChange={(e) => { setJobFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All jobs</option>
            {(jobs || []).map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button type="button" onClick={loadApplications} disabled={loading} className="btn-outline flex items-center gap-1">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No job applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{app.applicant_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{app.applicant_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{app.job_title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        app.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => openDetail(app)} className="btn-outline text-sm flex items-center gap-1 inline-flex">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="btn-outline text-sm py-1"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="btn-outline text-sm py-1"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeDetail} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job application</h3>
                <button type="button" onClick={closeDetail} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {loadingDetail ? (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              ) : detailApp ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applicant</p>
                    <p className="font-medium text-gray-900 dark:text-white">{detailApp.applicant_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-0.5">
                      <Mail className="h-4 w-4" />
                      {detailApp.applicant_email}
                    </p>
                    {detailApp.applicant_phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {detailApp.applicant_phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                    <p className="font-medium text-gray-900 dark:text-white">{detailApp.job_title}</p>
                    {detailApp.department && <p className="text-sm text-gray-600 dark:text-gray-300">{detailApp.department}</p>}
                    {detailApp.location && <p className="text-sm text-gray-600 dark:text-gray-300">{detailApp.location}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applied</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {detailApp.created_at ? new Date(detailApp.created_at).toLocaleString() : '—'}
                    </p>
                  </div>
                  {detailApp.cover_letter && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cover letter</p>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {detailApp.cover_letter}
                      </div>
                    </div>
                  )}
                  {detailApp.resume_path && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Resume</p>
                      <a
                        href={getResumeUrl(detailApp.resume_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Download / View resume
                      </a>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin notes</label>
                      <textarea
                        value={notesUpdate}
                        onChange={(e) => setNotesUpdate(e.target.value)}
                        rows={3}
                        className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Internal notes..."
                      />
                    </div>
                    <button type="button" onClick={handleSaveStatus} disabled={saving} className="btn-primary">
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationsList;
