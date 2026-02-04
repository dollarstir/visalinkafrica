import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, RefreshCw } from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const AgentApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAgentApplications({ status: statusFilter });
      setApplications(data.applications || []);
    } catch (err) {
      showError(err.message || 'Failed to load agent applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app) => {
    try {
      setActioningId(app.id);
      await apiService.approveAgentApplication(app.id);
      showSuccess(`${app.name} has been approved as an agent.`);
      await loadApplications();
    } catch (err) {
      showError(err.message || 'Failed to approve');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (app) => {
    if (!window.confirm(`Reject ${app.name} (${app.email})? They will remain a regular user.`)) return;
    try {
      setActioningId(app.id);
      await apiService.rejectAgentApplication(app.id);
      showSuccess('Application rejected.');
      await loadApplications();
    } catch (err) {
      showError(err.message || 'Failed to reject');
    } finally {
      setActioningId(null);
    }
  };

  if (!hasPermission(user, 'users.view') && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent applications</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and approve or reject requests to become an agent.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="btn-outline flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading && applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No {statusFilter} applications.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  {statusFilter === 'pending' && hasPermission(user, 'users.edit') && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{app.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          app.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    {statusFilter === 'pending' && hasPermission(user, 'users.edit') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(app)}
                            disabled={actioningId !== null}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg disabled:opacity-50"
                          >
                            <UserCheck className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(app)}
                            disabled={actioningId !== null}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg disabled:opacity-50"
                          >
                            <UserX className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentApplications;
