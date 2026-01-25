import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import NewApplicationModal from './NewApplicationModal';
import EditApplicationModal from './EditApplicationModal';
import ViewApplicationModal from './ViewApplicationModal';

const Applications = () => {
  const { user } = useAuth();
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showEditApplicationModal, setShowEditApplicationModal] = useState(false);
  const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [applications, setApplications] = useState([]);
  const [showOnlyMyApplications, setShowOnlyMyApplications] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0
  });

  // Load current staff ID for logged-in staff user
  useEffect(() => {
    const loadCurrentStaff = async () => {
      try {
        if (!user || user.role !== 'staff' || !user.email) return;
        const params = {
          page: 1,
          limit: 5,
          search: user.email,
          status: 'all'
        };
        const response = await apiService.getStaff(params);
        const staffList = response.staff || [];
        const matched = staffList.find(
          (m) => m.email && m.email.toLowerCase() === user.email.toLowerCase()
        );
        if (matched) {
          setCurrentStaffId(matched.id);
        }
      } catch (err) {
        console.error('Error loading current staff info:', err);
      }
    };

    loadCurrentStaff();
  }, [user]);

  // Load applications on mount and when filters change
  useEffect(() => {
    loadApplications();
  }, [statusFilter, priorityFilter, searchTerm]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build params object - only include defined values
      const params = {
        page: 1,
        limit: 100
      };
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Only send status/priority if they're not 'all'
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (priorityFilter && priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }
      
      const response = await apiService.getApplications(params);
      console.log('Applications API response:', response);
      
      // Transform API data to match frontend format
      const transformedApplications = (response.applications || []).map(app => {
        console.log('Transforming application:', app);

        // Determine source info from creator (who created the application)
        let sourceType = 'Other';
        let sourceLabel = 'System';

        if (app.creator_role === 'agent') {
          sourceType = 'Agent';
          sourceLabel = app.creator_name || 'Agent';
        } else if (app.creator_role === 'staff') {
          sourceType = 'Staff';
          sourceLabel = app.creator_name || 'Staff';
        } else if (app.creator_role === 'admin') {
          sourceType = 'Admin';
          sourceLabel = app.creator_name || 'Admin / Back Office';
        } else if (app.agent_user_id) {
          // Fallback: if creator_role is missing but agent_user_id exists
          sourceType = 'Agent';
          sourceLabel = app.agent_name || `Agent #${app.agent_user_id}`;
        } else if (app.staff_id) {
          // Fallback: created by staff if no creator info but staff assigned
          sourceType = 'Staff';
          sourceLabel = app.staff_name || `Staff #${app.staff_id}`;
        } else {
          sourceType = 'Admin';
          sourceLabel = 'Admin / Back Office';
        }

        return {
          id: app.id,
          customerName: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
          customerEmail: app.email || '',
          customerPhone: app.phone || '',
          service: app.service_name || '',
          status: app.status || 'draft',
          priority: app.priority || 'normal',
          createdAt: app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
          updatedAt: app.updated_at ? new Date(app.updated_at).toLocaleDateString() : '',
          assignedTo: app.staff_name || '',
          notes: app.notes || '',
          documents: app.documents || [],
          estimated_completion_date: app.estimated_completion_date,
          actual_completion_date: app.actual_completion_date,
          sourceType,
          sourceLabel,
          // For API calls / additional info
          customer_id: app.customer_id,
          service_id: app.service_id,
          staff_id: app.staff_id,
          agent_user_id: app.agent_user_id,
          creator_name: app.creator_name,
          creator_role: app.creator_role
        };
      });
      
      console.log('Transformed applications:', transformedApplications);
      setApplications(transformedApplications);
      
      // Calculate status counts
      const counts = {
        total: transformedApplications.length,
        draft: transformedApplications.filter(a => a.status === 'draft').length,
        pending: transformedApplications.filter(a => a.status === 'pending').length,
        submitted: transformedApplications.filter(a => a.status === 'submitted').length,
        under_review: transformedApplications.filter(a => a.status === 'under_review').length,
        approved: transformedApplications.filter(a => a.status === 'approved').length,
        rejected: transformedApplications.filter(a => a.status === 'rejected').length
      };
      setStatusCounts(counts);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = async (application) => {
    try {
      // Fetch full application details
      const response = await apiService.getApplication(application.id);
      const app = response.application;
      
      const transformedApp = {
        id: app.id,
        customerName: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
        customerEmail: app.email || '',
        customerPhone: app.phone || '',
        customerId: app.customer_id,
        serviceName: app.service_name || '',
        serviceId: app.service_id,
        status: app.status || 'draft',
        priority: app.priority || 'normal',
        createdAt: app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
        updatedAt: app.updated_at ? new Date(app.updated_at).toLocaleDateString() : '',
        assignedTo: app.staff_name || '',
        staffId: app.staff_id,
        notes: app.notes || '',
        documents: app.documents || [],
        estimated_completion_date: app.estimated_completion_date,
        actual_completion_date: app.actual_completion_date
      };
      
      setSelectedApplication(transformedApp);
      setShowViewApplicationModal(true);
    } catch (err) {
      console.error('Error loading application details:', err);
      showError('Failed to load application details');
    }
  };

  const handleEditApplication = async (application) => {
    try {
      // Fetch full application details
      const response = await apiService.getApplication(application.id);
      const app = response.application;
      
      const transformedApp = {
        id: app.id,
        customer_id: app.customer_id,
        service_id: app.service_id,
        staff_id: app.staff_id,
        status: app.status || 'draft',
        priority: app.priority || 'normal',
        notes: app.notes || '',
        documents: app.documents || [],
        estimated_completion_date: app.estimated_completion_date,
        actual_completion_date: app.actual_completion_date
      };
      
      setSelectedApplication(transformedApp);
      setShowEditApplicationModal(true);
    } catch (err) {
      console.error('Error loading application details:', err);
      showError('Failed to load application details');
    }
  };

  const handleDeleteApplication = async (application) => {
    const confirmed = await showDeleteConfirm(
      `Application #${application.id}`,
      'application'
    );
    
    if (confirmed) {
      try {
        await apiService.deleteApplication(application.id);
        showSuccess('Application deleted successfully');
        loadApplications(); // Reload the list
      } catch (err) {
        console.error('Error deleting application:', err);
        showError(err.message || 'Failed to delete application');
      }
    }
  };

  const handleSaveApplication = async (applicationData) => {
    try {
      await apiService.updateApplication(selectedApplication.id, applicationData);
      showSuccess('Application updated successfully');
      setShowEditApplicationModal(false);
      setSelectedApplication(null);
      loadApplications(); // Reload the list
    } catch (err) {
      console.error('Error updating application:', err);
      showError(err.message || 'Failed to update application');
    }
  };

  const handleCreateApplication = async (applicationData) => {
    try {
      const response = await apiService.createApplication(applicationData);
      console.log('Application created:', response);
      
      // Close modal first
      setShowNewApplicationModal(false);
      
      // Reset filters to 'all' to show the new application
      setStatusFilter('all');
      setPriorityFilter('all');
      setSearchTerm('');
      
      // Small delay to ensure database transaction is complete, then reload
      setTimeout(() => {
        loadApplications();
      }, 500);
      
      showSuccess('Application created successfully');
    } catch (err) {
      console.error('Error creating application:', err);
      showError(err.message || 'Failed to create application');
      throw err; // Re-throw so modal can handle it
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `#${app.id}`.includes(searchTerm.toLowerCase());

    // For staff, optionally show only applications assigned to them (by staff_id)
    const matchesAssignment =
      !showOnlyMyApplications ||
      (user?.role === 'staff' && currentStaffId && app.staff_id === currentStaffId);

    return matchesSearch && matchesAssignment;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  if (loading && applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            {user?.role === 'agent'
              ? 'Create and manage applications for your customers'
              : 'Manage all customer applications and their status'}
          </p>
        </div>
        {(hasPermission(user, 'applications.create') || user?.role === 'agent') && (
          <button
            onClick={() => setShowNewApplicationModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Application</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-500">{statusCounts.draft}</div>
          <div className="text-sm text-gray-600">Draft</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.under_review}</div>
          <div className="text-sm text-gray-600">In Review</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.submitted}</div>
          <div className="text-sm text-gray-600">Submitted</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {user?.role === 'staff' && (
            <div className="flex items-center space-x-2">
              <input
                id="my-applications-toggle"
                type="checkbox"
                checked={showOnlyMyApplications}
                onChange={(e) => setShowOnlyMyApplications(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="my-applications-toggle" className="text-sm text-gray-700">
                Show only applications assigned to me
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No applications found'}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">#{app.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.customerName}</div>
                      <div className="text-sm text-gray-500">{app.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        app.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        app.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        app.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                        {app.priority?.charAt(0).toUpperCase() + app.priority?.slice(1) || 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-700">
                        {app.sourceType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {app.sourceLabel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{app.assignedTo || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{app.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {(hasPermission(user, 'applications.view') || user?.role === 'agent') && (
                        <button 
                          onClick={() => handleViewApplication(app)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Application"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(user, 'applications.edit') && (
                        <button 
                          onClick={() => handleEditApplication(app)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Application"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(user, 'applications.delete') && (
                        <button 
                          onClick={() => handleDeleteApplication(app)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Application"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Application Modal */}
      {showNewApplicationModal && (
        <NewApplicationModal
          onClose={() => setShowNewApplicationModal(false)}
          onSave={handleCreateApplication}
        />
      )}

      {/* Edit Application Modal */}
      {showEditApplicationModal && selectedApplication && (
        <EditApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowEditApplicationModal(false);
            setSelectedApplication(null);
          }}
          onSave={handleSaveApplication}
        />
      )}

      {/* View Application Modal */}
      {showViewApplicationModal && selectedApplication && (
        <ViewApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowViewApplicationModal(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
};

export default Applications;
