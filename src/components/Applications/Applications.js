import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import NewApplicationModal from './NewApplicationModal';
import EditApplicationModal from './EditApplicationModal';
import ViewApplicationModal from './ViewApplicationModal';

const Applications = () => {
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showEditApplicationModal, setShowEditApplicationModal] = useState(false);
  const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with API calls
  const applications = [
    {
      id: 'APP-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      service: 'Passport Application',
      category: 'Document',
      status: 'Pending',
      priority: 'High',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      assignedTo: 'Sarah Wilson',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'APP-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      service: 'Birth Certificate',
      category: 'Document',
      status: 'Submitted',
      priority: 'Medium',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14',
      assignedTo: 'Mike Johnson',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'APP-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      service: 'School Application',
      category: 'Education',
      status: 'Draft',
      priority: 'Low',
      createdAt: '2024-01-13',
      updatedAt: '2024-01-13',
      assignedTo: 'Lisa Davis',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'APP-004',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      service: 'Visa Application',
      category: 'Travel',
      status: 'In Review',
      priority: 'High',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12',
      assignedTo: 'David Brown',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-review', label: 'In Review' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowViewApplicationModal(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setShowEditApplicationModal(true);
  };

  const handleDeleteApplication = (application) => {
    if (window.confirm(`Are you sure you want to delete application ${application.id}?`)) {
      // Handle delete - API call will go here
      console.log('Deleting application:', application.id);
    }
  };

  const handleSaveApplication = (updatedApplication) => {
    // Handle save - API call will go here
    console.log('Saving application:', updatedApplication);
    // For now, just close the modal
    setShowEditApplicationModal(false);
    setSelectedApplication(null);
  };

  const getStatusCounts = () => {
    const counts = {
      total: applications.length,
      draft: applications.filter(app => app.status === 'Draft').length,
      pending: applications.filter(app => app.status === 'Pending').length,
      submitted: applications.filter(app => app.status === 'Submitted').length,
      inReview: applications.filter(app => app.status === 'In Review').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">Manage all customer applications and their status</p>
        </div>
        <button
          onClick={() => setShowNewApplicationModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Application</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <div className="text-2xl font-bold text-blue-600">{statusCounts.inReview}</div>
          <div className="text-sm text-gray-600">In Review</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.submitted}</div>
          <div className="text-sm text-gray-600">Submitted</div>
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
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{app.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.customerName}</div>
                      <div className="text-sm text-gray-500">{app.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.service}</div>
                      <div className="text-sm text-gray-500">{app.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.priority === 'High' ? 'bg-red-100 text-red-800' :
                      app.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {app.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{app.assignedTo}</span>
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
                      <button 
                        onClick={() => handleViewApplication(app)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Application"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditApplication(app)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Application"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteApplication(app)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Application Modal */}
      {showNewApplicationModal && (
        <NewApplicationModal
          onClose={() => setShowNewApplicationModal(false)}
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
