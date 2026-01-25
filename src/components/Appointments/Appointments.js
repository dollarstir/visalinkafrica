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
import NewAppointmentModal from './NewAppointmentModal';
import ViewAppointmentModal from './ViewAppointmentModal';
import EditAppointmentModal from './EditAppointmentModal';

const Appointments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load appointments data from API
  useEffect(() => {
    loadAppointments();
  }, [searchTerm, statusFilter, dateFilter]);

  // Check if user has permission to view appointments
  if (!hasPermission(user, 'appointments.view') && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const loadAppointments = async () => {
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
      
      if (dateFilter && dateFilter !== 'all') {
        params.date = dateFilter;
      }
      
      const response = await apiService.getAppointments(params);
      console.log('Appointments API response:', response);
      
      // Transform API data to match component format
      const transformedAppointments = (response.appointments || []).map(appointment => ({
        id: appointment.id.toString(),
        customerName: appointment.customer_name,
        customerEmail: appointment.customer_email,
        customerPhone: appointment.customer_phone || '',
        service: appointment.service,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        duration: appointment.duration || '60',
        status: appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending',
        staffMember: appointment.staff_member || '',
        location: appointment.location || '',
        notes: appointment.notes || '',
        reminderSent: appointment.reminder_sent || false,
        statusColor: getStatusColor(appointment.status)
      }));
      
      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err.message || 'Failed to load appointments. Please try again.');
      showError(err.message || 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(appointment.id).includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      total: appointments.length,
      pending: appointments.filter(a => a.status.toLowerCase() === 'pending').length,
      confirmed: appointments.filter(a => a.status.toLowerCase() === 'confirmed').length,
      completed: appointments.filter(a => a.status.toLowerCase() === 'completed').length,
      cancelled: appointments.filter(a => a.status.toLowerCase() === 'cancelled').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      await apiService.createAppointment(appointmentData);
      showSuccess('Appointment created successfully');
      await loadAppointments();
      setShowNewAppointmentModal(false);
    } catch (err) {
      console.error('Error adding appointment:', err);
      showError(err.message || 'Failed to add appointment. Please try again.');
      setError(err.message || 'Failed to add appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppointment = async (updatedAppointment) => {
    try {
      setLoading(true);
      await apiService.updateAppointment(selectedAppointment.id, updatedAppointment);
      showSuccess('Appointment updated successfully');
      await loadAppointments();
      setShowEditModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      showError(err.message || 'Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    const confirmed = await showDeleteConfirm(
      appointment ? `${appointment.customerName} - ${appointment.service}` : 'this appointment',
      'appointment'
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await apiService.deleteAppointment(appointmentId);
      showSuccess('Appointment deleted successfully');
      await loadAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      showError(err.message || 'Failed to delete appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Schedule and manage customer appointments</p>
        </div>
        {hasPermission(user, 'appointments.create') && (
          <button
            onClick={() => setShowNewAppointmentModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Appointment</span>
          </button>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
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
                placeholder="Search appointments..."
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
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      {error && <div className="card text-red-600">{error}</div>}
      {loading ? (
        <div className="card">Loading appointments...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {loading ? 'Loading...' : 'No appointments found'}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                            <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {appointment.appointmentTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.staffMember || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.statusColor}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {hasPermission(user, 'appointments.view') && (
                            <button 
                              onClick={() => handleViewAppointment(appointment)}
                              className="text-primary-600 hover:text-primary-900"
                              title="View appointment details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission(user, 'appointments.edit') && (
                            <button 
                              onClick={() => handleEditAppointment(appointment)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit appointment"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission(user, 'appointments.delete') && (
                            <button 
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete appointment"
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
      )}

      {/* Modals */}
      {showNewAppointmentModal && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointmentModal(false)}
          onSave={handleAddAppointment}
        />
      )}

      {showViewModal && selectedAppointment && (
        <ViewAppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowViewModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
};

export default Appointments;
