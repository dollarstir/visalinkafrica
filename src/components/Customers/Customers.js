import React, { useEffect, useState } from 'react';
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
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';

const Customers = () => {
  const { user } = useAuth();
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build params object - only include defined, non-empty values
      const params = {
        limit: 100,
        page: 1
      };
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const data = await apiService.getCustomers(params);
      console.log('Customers API response:', data); // Debug log
      
      const list = data.customers || [];
      console.log('Customers list:', list); // Debug log
      
      setCustomers(
        list.map((c) => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          dateOfBirth: c.date_of_birth || '',
          nationality: c.nationality || '',
          passportNumber: c.passport_number || '',
          gender: c.gender || '',
          occupation: c.occupation || '',
          city: c.city || '',
          state: c.state || '',
          country: c.country || '',
          emergencyContact: c.emergency_contact || '',
          emergencyPhone: c.emergency_phone || '',
          notes: c.notes || '',
          status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Active',
          totalApplications: 0,
          lastVisit: c.updated_at ? c.updated_at.split('T')[0] : '',
          createdAt: c.created_at,
          statusColor: c.status === 'active' ? 'bg-green-100 text-green-800' : 
                       c.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                       c.status === 'suspended' ? 'bg-red-100 text-red-800' :
                       'bg-green-100 text-green-800'
        }))
      );
    } catch (err) {
      console.error('Failed to load customers', err);
      setError(err.message || 'Failed to load customers');
      showError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

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
                         String(customer.id).includes(searchTerm);
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

  const handleDeleteCustomer = async (customer) => {
    const confirmed = await showDeleteConfirm(
      `${customer.firstName} ${customer.lastName}`,
      'customer'
    );
    
    if (!confirmed) return;
    
    try {
      await apiService.deleteCustomer(customer.id);
      showSuccess('Customer deleted successfully');
      await loadCustomers();
    } catch (err) {
      showError(err.message || 'Failed to delete customer');
    }
  };

  const handleSaveCustomer = async (payload) => {
    try {
      await apiService.updateCustomer(payload.id, {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        date_of_birth: payload.dateOfBirth,
        nationality: payload.nationality,
        passport_number: payload.passportNumber,
        gender: payload.gender,
        occupation: payload.occupation,
        city: payload.city,
        state: payload.state,
        country: payload.country,
        emergency_contact: payload.emergencyContact,
        emergency_phone: payload.emergencyPhone,
        notes: payload.notes,
        status: payload.status ? payload.status.toLowerCase() : 'active'
      });
      showSuccess('Customer updated successfully');
      setShowEditCustomerModal(false);
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (err) {
      showError(err.message || 'Failed to save customer');
    }
  };

  const statusCounts = {
    total: customers.length,
    active: customers.filter(customer => customer.status && customer.status.toLowerCase() === 'active').length,
    inactive: customers.filter(customer => customer.status && customer.status.toLowerCase() === 'inactive').length,
    suspended: customers.filter(customer => customer.status && customer.status.toLowerCase() === 'suspended').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'agent' 
              ? 'Manage your customers and track their applications'
              : 'Manage customer information and track their applications'
            }
          </p>
        </div>
        {(hasPermission(user, 'customers.create') || user?.role === 'agent') && (
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
          </button>
        )}
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
      {error && <div className="card text-red-600">{error}</div>}
      {loading ? (
        <div className="card">Loading customers...</div>
      ) : (
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
              {(hasPermission(user, 'customers.view') || user?.role === 'agent') && (
                <button 
                  onClick={() => handleViewCustomer(customer)}
                  className="flex-1 btn-outline text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
              )}
              {(hasPermission(user, 'customers.edit') || user?.role === 'agent') && (
                <button 
                  onClick={() => handleEditCustomer(customer)}
                  className="flex-1 btn-secondary text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
              {(hasPermission(user, 'customers.delete') || user?.role === 'agent') && (
                <button 
                  onClick={() => handleDeleteCustomer(customer)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete Customer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <NewCustomerModal
          onClose={() => setShowNewCustomerModal(false)}
          onSave={async (data) => {
            try {
              await apiService.createCustomer({
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                date_of_birth: data.dateOfBirth,
                nationality: data.nationality,
                passport_number: data.passportNumber,
                gender: data.gender,
                occupation: data.occupation,
                city: data.city,
                state: data.state,
                country: data.country,
                emergency_contact: data.emergencyContact,
                emergency_phone: data.emergencyPhone,
                notes: data.notes
              });
              showSuccess('Customer created successfully');
              setShowNewCustomerModal(false);
              await loadCustomers();
            } catch (err) {
              showError(err.message || 'Failed to create customer');
            }
          }}
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
