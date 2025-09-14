import React, { useState } from 'react';
import { X, User, FileText, Calendar, AlertCircle } from 'lucide-react';

const NewApplicationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    serviceCategory: '',
    service: '',
    servicePricingTier: '',
    priority: 'Medium',
    assignedTo: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Mock data - replace with API calls
  const customers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' }
  ];

  const serviceCategories = [
    { 
      id: '1', 
      name: 'Document', 
      services: [
        { 
          name: 'Passport Application', 
          pricingTiers: [
            { name: 'Regular', price: '$150.00', duration: '2-3 weeks', isDefault: true },
            { name: 'Express', price: '$250.00', duration: '1 week', isDefault: false }
          ]
        },
        { 
          name: 'Birth Certificate', 
          pricingTiers: [
            { name: 'Regular', price: '$75.00', duration: '1-2 weeks', isDefault: true },
            { name: 'Express', price: '$125.00', duration: '3-5 days', isDefault: false }
          ]
        },
        { 
          name: 'ID Card', 
          pricingTiers: [
            { name: 'Regular', price: '$50.00', duration: '1-2 weeks', isDefault: true }
          ]
        }
      ]
    },
    { 
      id: '2', 
      name: 'Education', 
      services: [
        { 
          name: 'School Application', 
          pricingTiers: [
            { name: 'Regular', price: '$100.00', duration: '2-4 weeks', isDefault: true }
          ]
        },
        { 
          name: 'University Application', 
          pricingTiers: [
            { name: 'Standard', price: '$200.00', duration: '3-4 weeks', isDefault: true },
            { name: 'Express', price: '$300.00', duration: '1-2 weeks', isDefault: false }
          ]
        }
      ]
    },
    { 
      id: '3', 
      name: 'Travel', 
      services: [
        { 
          name: 'Visa Application', 
          pricingTiers: [
            { name: 'Standard', price: '$200.00', duration: '3-4 weeks', isDefault: true },
            { name: 'Express', price: '$350.00', duration: '1-2 weeks', isDefault: false },
            { name: 'Premium', price: '$500.00', duration: '3-5 days', isDefault: false }
          ]
        },
        { 
          name: 'Travel Insurance', 
          pricingTiers: [
            { name: 'Basic', price: '$50.00', duration: '1 day', isDefault: true },
            { name: 'Premium', price: '$100.00', duration: '1 day', isDefault: false }
          ]
        }
      ]
    },
    { 
      id: '4', 
      name: 'Business', 
      services: [
        { 
          name: 'Business Registration', 
          pricingTiers: [
            { name: 'Standard', price: '$300.00', duration: '4-6 weeks', isDefault: true },
            { name: 'Express', price: '$450.00', duration: '2-3 weeks', isDefault: false }
          ]
        }
      ]
    }
  ];

  const staffMembers = [
    { id: '1', name: 'Sarah Wilson' },
    { id: '2', name: 'Mike Johnson' },
    { id: '3', name: 'Lisa Davis' },
    { id: '4', name: 'David Brown' }
  ];

  const selectedCategory = serviceCategories.find(cat => cat.id === formData.serviceCategory);
  const selectedService = selectedCategory?.services.find(service => service.name === formData.service);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-select default pricing tier when service changes
      if (name === 'service' && value) {
        const category = serviceCategories.find(cat => cat.id === prev.serviceCategory);
        const service = category?.services.find(s => s.name === value);
        if (service && service.pricingTiers.length > 0) {
          const defaultTier = service.pricingTiers.find(tier => tier.isDefault);
          if (defaultTier) {
            newData.servicePricingTier = defaultTier.name;
          }
        }
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required';
    if (!formData.service) newErrors.service = 'Service is required';
    
    // Check if service has multiple pricing tiers and none is selected
    if (selectedService && selectedService.pricingTiers.length > 1 && !formData.servicePricingTier) {
      newErrors.servicePricingTier = 'Please select a service type';
    }
    
    if (!formData.assignedTo) newErrors.assignedTo = 'Assigned staff is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Handle form submission - API call will go here
      console.log('Form submitted:', formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Application</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <label className="label">Customer *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.customerId ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.customerId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.customerId}
                    </p>
                  )}
                </div>

                {/* Service Category */}
                <div>
                  <label className="label">Service Category *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.serviceCategory ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a category</option>
                      {serviceCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.serviceCategory && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.serviceCategory}
                    </p>
                  )}
                </div>

                {/* Service Selection */}
                <div>
                  <label className="label">Service *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      disabled={!selectedCategory}
                      className={`input-field pl-10 ${errors.service ? 'border-red-500' : ''} ${!selectedCategory ? 'bg-gray-100' : ''}`}
                    >
                      <option value="">Select a service</option>
                      {selectedCategory?.services.map(service => (
                        <option key={service.name} value={service.name}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.service && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.service}
                    </p>
                  )}
                </div>

                {/* Service Pricing Tier Selection */}
                {selectedService && selectedService.pricingTiers.length > 1 && (
                  <div>
                    <label className="label">Service Type *</label>
                    <div className="space-y-2">
                      {selectedService.pricingTiers.map((tier, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="servicePricingTier"
                            value={tier.name}
                            checked={formData.servicePricingTier === tier.name}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {tier.name} {tier.isDefault && '(Default)'}
                              </span>
                              <span className="text-sm font-bold text-primary-600">{tier.price}</span>
                            </div>
                            <p className="text-xs text-gray-500">Duration: {tier.duration}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.servicePricingTier && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.servicePricingTier}
                      </p>
                    )}
                  </div>
                )}

                {/* Single Pricing Tier Display */}
                {selectedService && selectedService.pricingTiers.length === 1 && (
                  <div>
                    <label className="label">Service Details</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {selectedService.pricingTiers[0].name}
                        </span>
                        <span className="text-sm font-bold text-primary-600">
                          {selectedService.pricingTiers[0].price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {selectedService.pricingTiers[0].duration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div>
                  <label className="label">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="label">Assign To *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.assignedTo ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select staff member</option>
                      {staffMembers.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.assignedTo && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.assignedTo}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    placeholder="Additional notes or requirements..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto sm:ml-3"
              >
                Create Application
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewApplicationModal;
