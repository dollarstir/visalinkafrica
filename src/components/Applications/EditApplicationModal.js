import React, { useState, useEffect } from 'react';
import { X, FileText, User, DollarSign, AlertCircle } from 'lucide-react';

const EditApplicationModal = ({ application, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    serviceCategoryId: '',
    serviceId: '',
    servicePricingTier: '',
    status: '',
    priority: 'medium',
    notes: '',
    documents: []
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
      name: 'Document Services',
      services: [
        {
          id: '1',
          name: 'Birth Certificate',
          pricingTiers: [
            { id: 'regular', name: 'Regular', price: 150, duration: '7-10 days', isDefault: true },
            { id: 'express', name: 'Express', price: 250, duration: '3-5 days', isDefault: false }
          ]
        },
        {
          id: '2',
          name: 'Passport Application',
          pricingTiers: [
            { id: 'regular', name: 'Regular', price: 200, duration: '14-21 days', isDefault: true },
            { id: 'express', name: 'Express', price: 350, duration: '7-10 days', isDefault: false }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Travel Services',
      services: [
        {
          id: '3',
          name: 'Visa Application',
          pricingTiers: [
            { id: 'standard', name: 'Standard', price: 300, duration: '15-30 days', isDefault: true }
          ]
        }
      ]
    }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    if (application) {
      setFormData({
        customerId: application.customerId || '',
        serviceCategoryId: application.serviceCategoryId || '',
        serviceId: application.serviceId || '',
        servicePricingTier: application.servicePricingTier || '',
        status: application.status || '',
        priority: application.priority || 'medium',
        notes: application.notes || '',
        documents: application.documents || []
      });
    }
  }, [application]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-select default pricing tier when service changes
    if (name === 'serviceId') {
      const selectedCategory = serviceCategories.find(cat => cat.id === formData.serviceCategoryId);
      const selectedService = selectedCategory?.services.find(service => service.id === value);
      if (selectedService && selectedService.pricingTiers.length > 0) {
        const defaultTier = selectedService.pricingTiers.find(tier => tier.isDefault);
        if (defaultTier) {
          setFormData(prev => ({
            ...prev,
            servicePricingTier: defaultTier.id
          }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.serviceCategoryId) {
      newErrors.serviceCategoryId = 'Service category is required';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Service is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({ ...application, ...formData });
      onClose();
    }
  };

  const selectedCategory = serviceCategories.find(cat => cat.id === formData.serviceCategoryId);
  const selectedService = selectedCategory?.services.find(service => service.id === formData.serviceId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Edit Application</h3>
                </div>
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

                {/* Service Category and Service */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Service Category *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="serviceCategoryId"
                        value={formData.serviceCategoryId}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.serviceCategoryId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select category</option>
                        {serviceCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.serviceCategoryId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.serviceCategoryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Service *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="serviceId"
                        value={formData.serviceId}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.serviceId ? 'border-red-500' : ''}`}
                        disabled={!formData.serviceCategoryId}
                      >
                        <option value="">Select service</option>
                        {selectedCategory?.services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.serviceId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.serviceId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Pricing Tier */}
                {selectedService && selectedService.pricingTiers.length > 0 && (
                  <div>
                    <label className="label">Pricing Tier *</label>
                    <div className="space-y-2">
                      {selectedService.pricingTiers.map(tier => (
                        <label key={tier.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="servicePricingTier"
                            value={tier.id}
                            checked={formData.servicePricingTier === tier.id}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{tier.name}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">{tier.duration}</span>
                                <span className="text-sm font-bold text-gray-900">${tier.price}</span>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Status *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.status ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select status</option>
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.status}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Priority</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                      >
                        {priorityOptions.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Additional notes about this application..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto sm:ml-3"
              >
                Save Changes
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

export default EditApplicationModal;

