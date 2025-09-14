import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Settings,
  FolderOpen,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import NewServiceModal from './NewServiceModal';

const Services = () => {
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with API calls
  const services = [
    {
      id: 'SRV-001',
      name: 'Passport Application',
      category: 'Document',
      categoryId: 'CAT-001',
      description: 'Complete passport application service including document preparation and submission',
      pricingTiers: [
        { name: 'Regular', price: '$150.00', duration: '2-3 weeks', isDefault: true },
        { name: 'Express', price: '$250.00', duration: '1 week', isDefault: false }
      ],
      isActive: true,
      totalApplications: 45,
      successRate: '95%',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
      requirements: ['Birth Certificate', 'ID Card', 'Passport Photos', 'Application Form'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'SRV-002',
      name: 'Birth Certificate',
      category: 'Document',
      categoryId: 'CAT-001',
      description: 'Birth certificate application and processing service',
      pricingTiers: [
        { name: 'Regular', price: '$75.00', duration: '1-2 weeks', isDefault: true },
        { name: 'Express', price: '$125.00', duration: '3-5 days', isDefault: false }
      ],
      isActive: true,
      totalApplications: 32,
      successRate: '98%',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-14',
      requirements: ['Hospital Records', 'Parent IDs', 'Application Form'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'SRV-003',
      name: 'Visa Application',
      category: 'Travel',
      categoryId: 'CAT-003',
      description: 'Tourist and business visa application assistance',
      pricingTiers: [
        { name: 'Standard', price: '$200.00', duration: '3-4 weeks', isDefault: true },
        { name: 'Express', price: '$350.00', duration: '1-2 weeks', isDefault: false },
        { name: 'Premium', price: '$500.00', duration: '3-5 days', isDefault: false }
      ],
      isActive: true,
      totalApplications: 28,
      successRate: '92%',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-13',
      requirements: ['Passport', 'Bank Statements', 'Travel Itinerary', 'Hotel Booking'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'SRV-004',
      name: 'School Application',
      category: 'Education',
      categoryId: 'CAT-002',
      description: 'Primary and secondary school application assistance',
      pricingTiers: [
        { name: 'Regular', price: '$100.00', duration: '2-4 weeks', isDefault: true }
      ],
      isActive: true,
      totalApplications: 15,
      successRate: '88%',
      createdAt: '2024-01-04',
      updatedAt: '2024-01-12',
      requirements: ['Academic Records', 'Birth Certificate', 'Recommendation Letters'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'SRV-005',
      name: 'Business Registration',
      category: 'Business',
      categoryId: 'CAT-004',
      description: 'Business registration and licensing services',
      pricingTiers: [
        { name: 'Standard', price: '$300.00', duration: '4-6 weeks', isDefault: true },
        { name: 'Express', price: '$450.00', duration: '2-3 weeks', isDefault: false }
      ],
      isActive: false,
      totalApplications: 8,
      successRate: '85%',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10',
      requirements: ['Business Plan', 'Tax ID', 'Bank Account', 'Registration Forms'],
      statusColor: 'bg-gray-100 text-gray-800'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'CAT-001', name: 'Document' },
    { id: 'CAT-002', name: 'Education' },
    { id: 'CAT-003', name: 'Travel' },
    { id: 'CAT-004', name: 'Business' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.categoryId === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      total: services.length,
      active: services.filter(service => service.isActive).length,
      inactive: services.filter(service => !service.isActive).length,
      totalApplications: services.reduce((sum, service) => sum + service.totalApplications, 0)
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage services offered to customers</p>
        </div>
        <button
          onClick={() => setShowNewServiceModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Services</div>
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
          <div className="text-2xl font-bold text-blue-600">{statusCounts.totalApplications}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
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
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.statusColor}`}>
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FolderOpen className="h-4 w-4 mr-2" />
                {service.category}
              </div>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Pricing Options
                </div>
              </div>
              <div className="space-y-1">
                {service.pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${tier.isDefault ? 'text-primary-600' : 'text-gray-700'}`}>
                      {tier.name} {tier.isDefault && '(Default)'}
                    </span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{tier.price}</span>
                      <span className="text-gray-500 ml-2">({tier.duration})</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Success Rate
                </div>
                <span className="font-medium text-green-600">{service.successRate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Applications
                </div>
                <span className="font-medium text-gray-900">{service.totalApplications}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Requirements:</p>
              <div className="space-y-1">
                {service.requirements.slice(0, 2).map((requirement, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {requirement}
                  </div>
                ))}
                {service.requirements.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{service.requirements.length - 2} more requirements
                  </div>
                )}
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

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="card text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first service.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowNewServiceModal(true)}
              className="btn-primary"
            >
              Add Service
            </button>
          )}
        </div>
      )}

      {/* New Service Modal */}
      {showNewServiceModal && (
        <NewServiceModal
          onClose={() => setShowNewServiceModal(false)}
        />
      )}
    </div>
  );
};

export default Services;
