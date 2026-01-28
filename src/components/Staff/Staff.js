import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Briefcase
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import NewStaffModal from './NewStaffModal';
import EditStaffModal from './EditStaffModal';
import ViewStaffModal from './ViewStaffModal';

const Staff = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showViewStaffModal, setShowViewStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load staff data from API
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build params object - only include defined, non-empty values
      const params = {
        limit: 100,
        page: 1
      };
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await apiService.getStaff(params);
      console.log('Staff API response:', response);
      
      // Transform API data to match component format
      const transformedStaff = (response.staff || []).map(member => ({
        id: member.id.toString(),
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        phone: member.phone || '',
        position: member.position || '',
        department: member.department || '',
        hireDate: member.hire_date || '',
        salary: member.salary || '',
        status: member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Active',
        location: member.location || '',
        workingHours: member.working_hours || '',
        totalApplications: member.total_applications || 0,
        currentWorkload: member.current_workload ? member.current_workload.charAt(0).toUpperCase() + member.current_workload.slice(1) : 'Low',
        statusColor: getStatusColor(member.status),
        userId: member.user_id || null,
        avatar: member.avatar || null
      }));
      
      setStaff(transformedStaff);
    } catch (err) {
      console.error('Error loading staff:', err);
      setError(err.message || 'Failed to load staff. Please try again.');
      showError(err.message || 'Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'administration', label: 'Administration' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(member.id).includes(searchTerm) ||
                         (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === 'all' || 
                             (member.department && member.department.toLowerCase().replace(/\s+/g, '-') === departmentFilter);
    
    const matchesStatus = statusFilter === 'all' || 
                         (member.status && member.status.toLowerCase().replace(/\s+/g, '-') === statusFilter);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      total: staff.length,
      active: staff.filter(member => member.status && member.status.toLowerCase() === 'active').length,
      onLeave: staff.filter(member => member.status && (member.status.toLowerCase() === 'on-leave' || member.status.toLowerCase() === 'on leave')).length,
      inactive: staff.filter(member => member.status && member.status.toLowerCase() === 'inactive').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleViewStaff = (member) => {
    setSelectedStaff(member);
    setShowViewStaffModal(true);
  };

  const handleEditStaff = (member) => {
    setSelectedStaff(member);
    setShowEditStaffModal(true);
  };

  const handleDeleteStaff = async (memberId) => {
    const member = staff.find(s => s.id === memberId);
    const confirmed = await showDeleteConfirm(
      member ? `${member.firstName} ${member.lastName}` : 'this staff member',
      'staff member'
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await apiService.deleteStaffMember(memberId);
      showSuccess('Staff member deleted successfully');
      await loadStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      showError(err.message || 'Failed to delete staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      setLoading(true);
      await apiService.createStaffMember(staffData);
      showSuccess('Staff member created successfully');
      await loadStaff();
      setShowNewStaffModal(false);
    } catch (err) {
      console.error('Error adding staff:', err);
      showError(err.message || 'Failed to add staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async (updatedStaff) => {
    try {
      setLoading(true);
      await apiService.updateStaffMember(selectedStaff.id, updatedStaff);
      showSuccess('Staff member updated successfully');
      await loadStaff();
      setShowEditStaffModal(false);
      setSelectedStaff(null);
    } catch (err) {
      console.error('Error updating staff:', err);
      showError(err.message || 'Failed to update staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff members, payroll, and leave requests</p>
        </div>
        {hasPermission(user, 'staff.create') && (
          <button
            onClick={() => setShowNewStaffModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Staff</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.onLeave}</div>
          <div className="text-sm text-gray-600">On Leave</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{statusCounts.inactive}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card hover:shadow-md transition-shadow duration-200 text-left">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Payroll</h3>
              <p className="text-sm text-gray-600">Manage staff salaries and payments</p>
            </div>
          </div>
        </button>
        <button className="card hover:shadow-md transition-shadow duration-200 text-left">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Leave Management</h3>
              <p className="text-sm text-gray-600">Track and approve leave requests</p>
            </div>
          </div>
        </button>
        <button className="card hover:shadow-md transition-shadow duration-200 text-left">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600">View staff performance metrics</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field"
            >
              {departmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

      {/* Staff Grid */}
      {error && <div className="card text-red-600">{error}</div>}
      {loading ? (
        <div className="card">Loading staff...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div key={member.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary-700">
                        {(member.firstName?.charAt(0) || member.lastName?.charAt(0) || '?').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{member.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.statusColor}`}>
                  {member.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {member.position} - {member.department}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {member.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {member.workingHours}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {member.salary}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div>
                  <span className="font-medium">{member.totalApplications}</span> applications
                </div>
                <div>
                  Workload:{' '}
                  <span
                    className={`font-medium ${
                      member.currentWorkload === 'High'
                        ? 'text-red-600'
                        : member.currentWorkload === 'Medium'
                        ? 'text-yellow-600'
                        : member.currentWorkload === 'Low'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {member.currentWorkload}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {hasPermission(user, 'staff.view') && (
                  <button
                    onClick={() => handleViewStaff(member)}
                    className="flex-1 btn-outline text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                )}
                {hasPermission(user, 'staff.edit') && (
                  <button
                    onClick={() => handleEditStaff(member)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
                {hasPermission(user, 'staff.delete') && (
                  <button
                    onClick={() => handleDeleteStaff(member.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete staff member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Staff Modal */}
      {showNewStaffModal && (
        <NewStaffModal
          onClose={() => setShowNewStaffModal(false)}
          onSave={handleAddStaff}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowEditStaffModal(false);
            setSelectedStaff(null);
          }}
          onSave={handleSaveStaff}
        />
      )}

      {/* View Staff Modal */}
      {showViewStaffModal && selectedStaff && (
        <ViewStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowViewStaffModal(false);
            setSelectedStaff(null);
          }}
        />
      )}
    </div>
  );
};

export default Staff;
