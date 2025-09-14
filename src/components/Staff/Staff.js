import React, { useState } from 'react';
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
import NewStaffModal from './NewStaffModal';

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);

  // Mock data - replace with API calls
  const staff = [
    {
      id: 'STAFF-001',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah@visalink.com',
      phone: '+1 (555) 111-2222',
      position: 'Senior Consultant',
      department: 'Consultation',
      hireDate: '2023-01-15',
      salary: '$65,000',
      status: 'Active',
      location: 'Main Office',
      workingHours: '9:00 AM - 5:00 PM',
      totalApplications: 45,
      currentWorkload: 'Medium',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'STAFF-002',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@visalink.com',
      phone: '+1 (555) 333-4444',
      position: 'Document Specialist',
      department: 'Documentation',
      hireDate: '2023-03-20',
      salary: '$55,000',
      status: 'Active',
      location: 'Main Office',
      workingHours: '8:30 AM - 4:30 PM',
      totalApplications: 32,
      currentWorkload: 'High',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'STAFF-003',
      firstName: 'Lisa',
      lastName: 'Davis',
      email: 'lisa@visalink.com',
      phone: '+1 (555) 555-6666',
      position: 'Customer Service Rep',
      department: 'Customer Service',
      hireDate: '2023-06-10',
      salary: '$45,000',
      status: 'Active',
      location: 'Main Office',
      workingHours: '9:00 AM - 6:00 PM',
      totalApplications: 28,
      currentWorkload: 'Low',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'STAFF-004',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@visalink.com',
      phone: '+1 (555) 777-8888',
      position: 'Junior Consultant',
      department: 'Consultation',
      hireDate: '2023-09-05',
      salary: '$50,000',
      status: 'On Leave',
      location: 'Main Office',
      workingHours: '9:00 AM - 5:00 PM',
      totalApplications: 15,
      currentWorkload: 'None',
      statusColor: 'bg-yellow-100 text-yellow-800'
    }
  ];

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
                         member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
                             member.department.toLowerCase().replace(' ', '-') === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         member.status.toLowerCase().replace(' ', '-') === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      total: staff.length,
      active: staff.filter(member => member.status === 'Active').length,
      onLeave: staff.filter(member => member.status === 'On Leave').length,
      inactive: staff.filter(member => member.status === 'Inactive').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff members, payroll, and leave requests</p>
        </div>
        <button
          onClick={() => setShowNewStaffModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Staff Member</span>
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
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
                Workload: <span className={`font-medium ${
                  member.currentWorkload === 'High' ? 'text-red-600' :
                  member.currentWorkload === 'Medium' ? 'text-yellow-600' :
                  member.currentWorkload === 'Low' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {member.currentWorkload}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 btn-outline text-sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <button className="flex-1 btn-secondary text-sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Staff Modal */}
      {showNewStaffModal && (
        <NewStaffModal
          onClose={() => setShowNewStaffModal(false)}
        />
      )}
    </div>
  );
};

export default Staff;
