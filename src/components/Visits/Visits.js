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
  FileText,
  CheckCircle
} from 'lucide-react';
import NewVisitModal from './NewVisitModal';

const Visits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);

  // Mock data - replace with API calls
  const visits = [
    {
      id: 'VISIT-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      visitType: 'Consultation',
      visitDate: '2024-01-15',
      visitTime: '10:00 AM',
      duration: '60 minutes',
      status: 'Completed',
      staffMember: 'Sarah Wilson',
      location: 'Office - Room A',
      purpose: 'Visa application consultation',
      outcome: 'Application submitted successfully',
      followUpRequired: false,
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'VISIT-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      visitType: 'Document Review',
      visitDate: '2024-01-14',
      visitTime: '2:00 PM',
      duration: '30 minutes',
      status: 'Completed',
      staffMember: 'Mike Johnson',
      location: 'Office - Room B',
      purpose: 'Passport document verification',
      outcome: 'Documents approved',
      followUpRequired: true,
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'VISIT-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      visitType: 'Follow-up',
      visitDate: '2024-01-13',
      visitTime: '11:30 AM',
      duration: '45 minutes',
      status: 'Scheduled',
      staffMember: 'Lisa Davis',
      location: 'Office - Room A',
      purpose: 'Application status update',
      outcome: '',
      followUpRequired: false,
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'VISIT-004',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      visitType: 'Initial Consultation',
      visitDate: '2024-01-12',
      visitTime: '9:00 AM',
      duration: '90 minutes',
      status: 'Cancelled',
      staffMember: 'David Brown',
      location: 'Office - Room C',
      purpose: 'New customer consultation',
      outcome: 'Customer cancelled due to emergency',
      followUpRequired: true,
      statusColor: 'bg-red-100 text-red-800'
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-gray-600">Track and manage customer visits and consultations</p>
        </div>
        <button
          onClick={() => setShowNewVisitModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Visit</span>
        </button>
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

      {/* New Visit Modal */}
      {showNewVisitModal && (
        <NewVisitModal
          onClose={() => setShowNewVisitModal(false)}
        />
      )}
    </div>
  );
};

export default Visits;
