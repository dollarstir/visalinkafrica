import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import NewVisitorModal from './NewVisitorModal';
import ViewVisitorModal from './ViewVisitorModal';
import EditVisitorModal from './EditVisitorModal';
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const Visitors = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewVisitorModal, setShowNewVisitorModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'no-show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || visitor.status.toLowerCase().replace(' ', '-') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      total: visitors.length,
      scheduled: visitors.filter(visitor => visitor.status === 'Scheduled').length,
      completed: visitors.filter(visitor => visitor.status === 'Completed').length,
      noShow: visitors.filter(visitor => visitor.status === 'No Show').length
    };
    return counts;
  };

  // Load visitors data from API
  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVisitors();
      
      // Transform API data to match component format
      const transformedVisitors = response.visitors.map(visitor => ({
        id: visitor.id.toString(),
        firstName: visitor.first_name,
        lastName: visitor.last_name,
        email: visitor.email,
        phone: visitor.phone,
        purpose: visitor.purpose,
        visitDate: new Date(visitor.visit_date).toLocaleDateString(),
        visitTime: visitor.visit_time,
        status: visitor.status.charAt(0).toUpperCase() + visitor.status.slice(1).replace('_', ' '),
        staffMember: visitor.staff_member,
        notes: visitor.notes,
        statusColor: getStatusColor(visitor.status)
      }));
      
      setVisitors(transformedVisitors);
      setError(null);
    } catch (err) {
      console.error('Error loading visitors:', err);
      setError('Failed to load visitors. Please try again.');
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

  const handleAddVisitor = async (visitorData) => {
    try {
      setLoading(true);
      await apiService.createVisitor(visitorData);
      showSuccess('Visitor created successfully');
      await loadVisitors(); // Refresh the list
      setShowNewVisitorModal(false);
    } catch (err) {
      console.error('Error adding visitor:', err);
      showError(err.message || 'Failed to add visitor. Please try again.');
      setError(err.message || 'Failed to add visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVisitor = async (updatedVisitor) => {
    try {
      setLoading(true);
      await apiService.updateVisitor(selectedVisitor.id, updatedVisitor);
      showSuccess('Visitor updated successfully');
      await loadVisitors(); // Refresh the list
      setShowEditModal(false);
      setSelectedVisitor(null);
    } catch (err) {
      console.error('Error updating visitor:', err);
      showError(err.message || 'Failed to update visitor. Please try again.');
      setError(err.message || 'Failed to update visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    const confirmed = await showDeleteConfirm('this visitor', 'visitor');
    
    if (confirmed) {
      try {
        setLoading(true);
        await apiService.deleteVisitor(visitorId);
        showSuccess('Visitor deleted successfully');
        await loadVisitors(); // Refresh the list
      } catch (err) {
        console.error('Error deleting visitor:', err);
        showError(err.message || 'Failed to delete visitor. Please try again.');
        setError(err.message || 'Failed to delete visitor. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const statusCounts = getStatusCounts();

  const handleViewVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setShowViewModal(true);
  };

  const handleEditVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setShowEditModal(true);
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-600">Track and manage visitor appointments and walk-ins</p>
        </div>
        {hasPermission(user, 'visitors.create') && (
          <button
            onClick={() => setShowNewVisitorModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Visitor</span>
          </button>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Visitors</div>
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
          <div className="text-2xl font-bold text-red-600">{statusCounts.noShow}</div>
          <div className="text-sm text-gray-600">No Show</div>
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
                placeholder="Search visitors..."
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

      {/* Visitors Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {visitor.firstName} {visitor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{visitor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visitor.email}</div>
                    <div className="text-sm text-gray-500">{visitor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{visitor.purpose}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      {visitor.visitDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {visitor.visitTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${visitor.statusColor}`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{visitor.staffMember}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewVisitor(visitor)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View visitor details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditVisitor(visitor)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit visitor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteVisitor(visitor.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete visitor"
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

      {/* Modals */}
      {showNewVisitorModal && (
        <NewVisitorModal
          onClose={() => setShowNewVisitorModal(false)}
          onSave={handleAddVisitor}
        />
      )}

      {showViewModal && selectedVisitor && (
        <ViewVisitorModal
          visitor={selectedVisitor}
          onClose={() => {
            setShowViewModal(false);
            setSelectedVisitor(null);
          }}
        />
      )}

      {showEditModal && selectedVisitor && (
        <EditVisitorModal
          visitor={selectedVisitor}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVisitor(null);
          }}
          onSave={handleUpdateVisitor}
        />
      )}
    </div>
  );
};

export default Visitors;


