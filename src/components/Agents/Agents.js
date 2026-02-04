import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  UserCheck,
  Mail,
  Phone,
  Eye,
  RefreshCw,
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';
import NewAgentModal from './NewAgentModal';

const statusLabels = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const Agents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDetail, setAgentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (search.trim()) params.search = search.trim();
      const data = await apiService.getAgents(params);
      setAgents(data.agents || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      showError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [pagination.page, search]);

  const handleAddAgent = () => {
    setShowNewAgentModal(true);
  };

  const handleSaveAgent = async (userData) => {
    try {
      await apiService.createUser({ ...userData, role: 'agent' });
      showSuccess('Agent added successfully');
      setShowNewAgentModal(false);
      loadAgents();
    } catch (err) {
      showError(err.message || 'Failed to add agent');
      throw err;
    }
  };

  const handleViewAgent = async (agent) => {
    setSelectedAgent(agent);
    setLoadingDetail(true);
    setAgentDetail(null);
    try {
      const data = await apiService.getAgent(agent.id);
      setAgentDetail(data.agent);
    } catch (err) {
      showError(err.message || 'Failed to load agent details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedAgent(null);
    setAgentDetail(null);
  };

  if (!hasPermission(user, 'agents.view') && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage agents and view their total applications and vital application info.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAgents}
            disabled={loading}
            className="btn-outline flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleAddAgent} className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add agent
          </button>
        </div>
      </div>

      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input-field w-full pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {loading && agents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No agents found. Add an agent or approve one from Agents Request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Draft</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Under review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rejected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{agent.name || '—'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{agent.department || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                          <Mail className="h-3.5 w-3 text-gray-400" /> {agent.email}
                        </span>
                        {agent.phone && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="h-3.5 w-3" /> {agent.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{agent.total_applications ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{agent.draft ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{agent.submitted ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{agent.under_review ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{agent.approved ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">{agent.rejected ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleViewAgent(agent)}
                        className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 text-sm"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} agents)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="btn-outline text-sm py-1"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="btn-outline text-sm py-1"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Agent detail modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80" onClick={closeDetail} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Agent details</h3>
                <button type="button" onClick={closeDetail} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  ×
                </button>
              </div>
              {loadingDetail ? (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              ) : agentDetail ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{agentDetail.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{agentDetail.email}</p>
                  </div>
                  {agentDetail.phone && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{agentDetail.phone}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application stats</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span>Total: <strong>{agentDetail.application_stats?.total_applications ?? 0}</strong></span>
                      <span>Draft: {agentDetail.application_stats?.draft ?? 0}</span>
                      <span>Submitted: {agentDetail.application_stats?.submitted ?? 0}</span>
                      <span>Under review: {agentDetail.application_stats?.under_review ?? 0}</span>
                      <span className="text-green-600 dark:text-green-400">Approved: {agentDetail.application_stats?.approved ?? 0}</span>
                      <span className="text-red-600 dark:text-red-400">Rejected: {agentDetail.application_stats?.rejected ?? 0}</span>
                    </div>
                  </div>
                  {(agentDetail.recent_applications?.length ?? 0) > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent applications</p>
                      <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                        {agentDetail.recent_applications.map((app) => (
                          <li key={app.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <span className="text-gray-700 dark:text-gray-300">
                              #{app.id} – {app.first_name} {app.last_name} ({app.service_name})
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              app.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {statusLabels[app.status] || app.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showNewAgentModal && (
        <NewAgentModal
          onClose={() => setShowNewAgentModal(false)}
          onSave={handleSaveAgent}
        />
      )}
    </div>
  );
};

export default Agents;
