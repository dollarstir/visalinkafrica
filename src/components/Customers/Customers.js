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
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import NewCustomerModal from './NewCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import ViewCustomerModal from './ViewCustomerModal';

const Customers = () => {
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with API calls
  const customers = [
    {
      id: 'CUST-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
      status: 'Active',
      totalApplications: 3,
      lastVisit: '2024-01-15',
      createdAt: '2024-01-01',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CUST-002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Los Angeles, CA 90210',
      status: 'Active',
      totalApplications: 1,
      lastVisit: '2024-01-14',
      createdAt: '2024-01-02',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CUST-003',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Chicago, IL 60601',
      status: 'Inactive',
      totalApplications: 0,
      lastVisit: '2023-12-20',
      createdAt: '2023-12-15',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'CUST-004',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah@example.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Houston, TX 77001',
      status: 'Active',
      totalApplications: 2,
      lastVisit: '2024-01-12',
      createdAt: '2023-12-20',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewCustomerModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerModal(true);
  };

  const handleDeleteCustomer = (customer) => {
    if (window.confirm(`Are you sure you want to delete customer ${customer.firstName} ${customer.lastName}?`)) {
      // Handle delete - API call will go here
      console.log('Deleting customer:', customer.id);
    }
  };

  const handleSaveCustomer = (updatedCustomer) => {
    // Handle save - API call will go here
    console.log('Saving customer:', updatedCustomer);
    // For now, just close the modal
    setShowEditCustomerModal(false);
    setSelectedCustomer(null);
  };

  const getStatusCounts = () => {
    const counts = {
      total: customers.length,
      active: customers.filter(customer => customer.status === 'Active').length,
      inactive: customers.filter(customer => customer.status === 'Inactive').length,
      suspended: customers.filter(customer => customer.status === 'Suspended').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customer information and track their applications</p>
        </div>
        <button
          onClick={() => setShowNewCustomerModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">{statusCounts.inactive}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{statusCounts.suspended}</div>
          <div className="text-sm text-gray-600">Suspended</div>
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
                placeholder="Search customers..."
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{customer.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.statusColor}`}>
                {customer.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{customer.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {customer.totalApplications} applications
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Last visit: {customer.lastVisit}
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewCustomer(customer)}
                className="flex-1 btn-outline text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <button 
                onClick={() => handleEditCustomer(customer)}
                className="flex-1 btn-secondary text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteCustomer(customer)}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Customer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <NewCustomerModal
          onClose={() => setShowNewCustomerModal(false)}
        />
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowEditCustomerModal(false);
            setSelectedCustomer(null);
          }}
          onSave={handleSaveCustomer}
        />
      )}

      {/* View Customer Modal */}
      {showViewCustomerModal && selectedCustomer && (
        <ViewCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowViewCustomerModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default Customers;
