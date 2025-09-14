import React, { useState } from 'react';
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

const Visitors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewVisitorModal, setShowNewVisitorModal] = useState(false);

  // Mock data - replace with API calls
  const visitors = [
    {
      id: 'VIS-001',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      phone: '+1 (555) 111-2222',
      purpose: 'Consultation',
      visitDate: '2024-01-15',
      visitTime: '10:00 AM',
      status: 'Completed',
      staffMember: 'Sarah Wilson',
      notes: 'Interested in visa application',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'VIS-002',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      phone: '+1 (555) 333-4444',
      purpose: 'Document Submission',
      visitDate: '2024-01-14',
      visitTime: '2:00 PM',
      status: 'Scheduled',
      staffMember: 'Mike Johnson',
      notes: 'Bringing passport documents',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'VIS-003',
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol@example.com',
      phone: '+1 (555) 555-6666',
      purpose: 'Follow-up',
      visitDate: '2024-01-13',
      visitTime: '11:30 AM',
      status: 'No Show',
      staffMember: 'Lisa Davis',
      notes: 'Application status inquiry',
      statusColor: 'bg-red-100 text-red-800'
    }
  ];

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

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-600">Track and manage visitor appointments and walk-ins</p>
        </div>
        <button
          onClick={() => setShowNewVisitorModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Visitor</span>
        </button>
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

      {/* New Visitor Modal */}
      {showNewVisitorModal && (
        <NewVisitorModal
          onClose={() => setShowNewVisitorModal(false)}
        />
      )}
    </div>
  );
};

export default Visitors;
