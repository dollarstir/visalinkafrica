import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle
} from 'lucide-react';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';
import NewVisitModal from './NewVisitModal';
import ViewVisitModal from './ViewVisitModal';
import EditVisitModal from './EditVisitModal';

const Visits = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load visits data from API
  useEffect(() => {
    loadVisits();
  }, []);

  // Check if user has permission to view visits
  if (!hasPermission(user, 'visits.view') && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  const loadVisits = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVisits();
      
      // Transform API data to match component format
      const transformedVisits = response.visits.map(visit => ({
        id: visit.id.toString(),
        customerName: visit.customer_name,
        customerEmail: visit.customer_email,
        visitType: visit.visit_type,
        visitDate: new Date(visit.visit_date).toLocaleDateString(),
        visitTime: visit.visit_time,
        duration: visit.duration,
        status: visit.status.charAt(0).toUpperCase() + visit.status.slice(1).replace('_', ' '),
        staffMember: visit.staff_member,
        location: visit.location,
        purpose: visit.purpose,
        outcome: visit.outcome,
        followUpRequired: visit.follow_up_required,
        statusColor: getStatusColor(visit.status)
      }));
      
      setVisits(transformedVisits);
      setError(null);
    } catch (err) {
      console.error('Error loading visits:', err);
      setError('Failed to load visits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'no_show':
      case 'no-show':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ];

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.visitType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || visit.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      total: visits.length,
      scheduled: visits.filter(visit => visit.status === 'Scheduled').length,
      completed: visits.filter(visit => visit.status === 'Completed').length,
      cancelled: visits.filter(visit => visit.status === 'Cancelled').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleViewVisit = (visit) => {
    setSelectedVisit(visit);
    setShowViewModal(true);
  };

  const handleEditVisit = (visit) => {
    setSelectedVisit(visit);
    setShowEditModal(true);
  };

  const handleAddVisit = async (visitData) => {
    try {
      setLoading(true);
      await apiService.createVisit(visitData);
      showSuccess('Visit created successfully');
      await loadVisits(); // Refresh the list
      setShowNewVisitModal(false);
    } catch (err) {
      console.error('Error adding visit:', err);
      showError(err.message || 'Failed to add visit. Please try again.');
      setError(err.message || 'Failed to add visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisit = async (updatedVisit) => {
    try {
      setLoading(true);
      await apiService.updateVisit(selectedVisit.id, updatedVisit);
      showSuccess('Visit updated successfully');
      await loadVisits(); // Refresh the list
      setShowEditModal(false);
      setSelectedVisit(null);
    } catch (err) {
      console.error('Error updating visit:', err);
      showError(err.message || 'Failed to update visit. Please try again.');
      setError(err.message || 'Failed to update visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    const confirmed = await showDeleteConfirm('this visit', 'visit');
    
    if (confirmed) {
      try {
        setLoading(true);
        await apiService.deleteVisit(visitId);
        showSuccess('Visit deleted successfully');
        await loadVisits(); // Refresh the list
      } catch (err) {
        console.error('Error deleting visit:', err);
        setError('Failed to delete visit. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-gray-600">Track and manage customer visits and consultations</p>
        </div>
        {hasPermission(user, 'visits.create') && (
          <button
            onClick={() => setShowNewVisitModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Schedule Visit</span>
          </button>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Visits</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
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
                placeholder="Search visits..."
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

      {/* Visits Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follow-up
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{visit.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{visit.customerName}</div>
                      <div className="text-sm text-gray-500">{visit.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{visit.visitType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      {visit.visitDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {visit.visitTime} ({visit.duration})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{visit.staffMember}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${visit.statusColor}`}>
                      {visit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visit.followUpRequired ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Complete
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {hasPermission(user, 'visits.view') && (
                        <button 
                          onClick={() => handleViewVisit(visit)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View visit details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(user, 'visits.edit') && (
                        <button 
                          onClick={() => handleEditVisit(visit)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit visit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(user, 'visits.delete') && (
                        <button 
                          onClick={() => handleDeleteVisit(visit.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete visit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showNewVisitModal && (
        <NewVisitModal
          onClose={() => setShowNewVisitModal(false)}
          onSave={handleAddVisit}
        />
      )}

      {showViewModal && selectedVisit && (
        <ViewVisitModal
          visit={selectedVisit}
          onClose={() => {
            setShowViewModal(false);
            setSelectedVisit(null);
          }}
        />
      )}

      {showEditModal && selectedVisit && (
        <EditVisitModal
          visit={selectedVisit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVisit(null);
          }}
          onSave={handleSaveVisit}
        />
      )}
    </div>
  );
};

export default Visits;
