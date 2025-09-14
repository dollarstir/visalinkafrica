import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import NewAppointmentModal from './NewAppointmentModal';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  // Mock data - replace with API calls
  const appointments = [
    {
      id: 'APT-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 123-4567',
      service: 'Visa Consultation',
      appointmentDate: '2024-01-16',
      appointmentTime: '10:00 AM',
      duration: '60 minutes',
      status: 'Confirmed',
      staffMember: 'Sarah Wilson',
      location: 'Office - Room A',
      notes: 'First-time visa applicant',
      reminderSent: true,
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'APT-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '+1 (555) 234-5678',
      service: 'Document Review',
      appointmentDate: '2024-01-16',
      appointmentTime: '2:00 PM',
      duration: '30 minutes',
      status: 'Pending',
      staffMember: 'Mike Johnson',
      location: 'Office - Room B',
      notes: 'Bringing passport and birth certificate',
      reminderSent: false,
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'APT-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 (555) 345-6789',
      service: 'Application Submission',
      appointmentDate: '2024-01-17',
      appointmentTime: '9:00 AM',
      duration: '45 minutes',
      status: 'Confirmed',
      staffMember: 'Lisa Davis',
      location: 'Office - Room A',
      notes: 'Final submission of visa application',
      reminderSent: true,
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'APT-004',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 (555) 456-7890',
      service: 'Follow-up Consultation',
      appointmentDate: '2024-01-15',
      appointmentTime: '3:30 PM',
      duration: '30 minutes',
      status: 'Cancelled',
      staffMember: 'David Brown',
      location: 'Office - Room C',
      notes: 'Customer requested to reschedule',
      reminderSent: false,
      statusColor: 'bg-red-100 text-red-800'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
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
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter;
    
    // Simple date filtering - in real app, you'd implement proper date logic
    const matchesDate = dateFilter === 'all' || true; // Placeholder
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusCounts = () => {
    const counts = {
      total: appointments.length,
      pending: appointments.filter(apt => apt.status === 'Pending').length,
      confirmed: appointments.filter(apt => apt.status === 'Confirmed').length,
      cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
      completed: appointments.filter(apt => apt.status === 'Completed').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Schedule and manage customer appointments</p>
        </div>
        <button
          onClick={() => setShowNewAppointmentModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Appointment</span>
        </button>
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
          <div className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
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
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment ID
                </th>
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
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{appointment.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                      <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                      <div className="text-sm text-gray-500">{appointment.customerPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{appointment.service}</span>
                    <div className="text-sm text-gray-500">{appointment.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      {appointment.appointmentDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.appointmentTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {appointment.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{appointment.staffMember}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.statusColor}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.reminderSent ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Sent
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-400">
                        <XCircle className="h-4 w-4 mr-1" />
                        Not Sent
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointmentModal(false)}
        />
      )}
    </div>
  );
};

export default Appointments;
