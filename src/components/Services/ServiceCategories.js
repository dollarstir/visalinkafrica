import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  FolderOpen,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react';
import NewCategoryModal from './NewCategoryModal';

const ServiceCategories = () => {
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API calls
  const categories = [
    {
      id: 'CAT-001',
      name: 'Document',
      description: 'Document-related services including passport, birth certificate, and ID applications',
      totalServices: 5,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
      services: ['Passport Application', 'Birth Certificate', 'ID Card', 'Driver License', 'Marriage Certificate'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CAT-002',
      name: 'Education',
      description: 'Educational services including school and university applications',
      totalServices: 3,
      isActive: true,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-14',
      services: ['School Application', 'University Application', 'Scholarship Application'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CAT-003',
      name: 'Travel',
      description: 'Travel-related services including visa applications and travel insurance',
      totalServices: 4,
      isActive: true,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-13',
      services: ['Visa Application', 'Travel Insurance', 'Flight Booking', 'Hotel Reservation'],
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CAT-004',
      name: 'Business',
      description: 'Business services including registration and permit applications',
      totalServices: 2,
      isActive: false,
      createdAt: '2024-01-04',
      updatedAt: '2024-01-12',
      services: ['Business Registration', 'Tax Filing'],
      statusColor: 'bg-gray-100 text-gray-800'
    }
  ];

  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusCounts = () => {
    const counts = {
      total: categories.length,
      active: categories.filter(cat => cat.isActive).length,
      inactive: categories.filter(cat => !cat.isActive).length,
      totalServices: categories.reduce((sum, cat) => sum + cat.totalServices, 0)
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
          <p className="text-gray-600">Manage service categories and organize your services</p>
        </div>
        <button
          onClick={() => setShowNewCategoryModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Categories</div>
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
          <div className="text-2xl font-bold text-blue-600">{statusCounts.totalServices}</div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.statusColor}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{category.description}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Services ({category.totalServices})</span>
                <span>Updated: {category.updatedAt}</span>
              </div>
              
              <div className="space-y-1">
                {category.services.slice(0, 3).map((service, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <FileText className="h-3 w-3 mr-2" />
                    {service}
                  </div>
                ))}
                {category.services.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{category.services.length - 3} more services
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
      {filteredCategories.length === 0 && (
        <div className="card text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first service category.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="btn-primary"
            >
              Add Category
            </button>
          )}
        </div>
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowNewCategoryModal(false)}
        />
      )}
    </div>
  );
};

export default ServiceCategories;

