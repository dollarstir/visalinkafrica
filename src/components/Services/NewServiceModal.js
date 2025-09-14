import React, { useState } from 'react';
import { X, Settings, FolderOpen, DollarSign, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';

const NewServiceModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    pricingTiers: [
      { name: 'Regular', price: '', duration: '', isDefault: true }
    ],
    isActive: true,
    requirements: ['']
  });

  const [errors, setErrors] = useState({});

  // Mock data - replace with API calls
  const categories = [
    { id: 'CAT-001', name: 'Document' },
    { id: 'CAT-002', name: 'Education' },
    { id: 'CAT-003', name: 'Travel' },
    { id: 'CAT-004', name: 'Business' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  const handlePricingTierChange = (index, field, value) => {
    const newPricingTiers = [...formData.pricingTiers];
    newPricingTiers[index] = {
      ...newPricingTiers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      pricingTiers: newPricingTiers
    }));
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [...prev.pricingTiers, { name: '', price: '', duration: '', isDefault: false }]
    }));
  };

  const removePricingTier = (index) => {
    if (formData.pricingTiers.length > 1) {
      const newPricingTiers = formData.pricingTiers.filter((_, i) => i !== index);
      // Ensure at least one tier is marked as default
      if (newPricingTiers.length > 0 && !newPricingTiers.some(tier => tier.isDefault)) {
        newPricingTiers[0].isDefault = true;
      }
      setFormData(prev => ({
        ...prev,
        pricingTiers: newPricingTiers
      }));
    }
  };

  const setDefaultPricingTier = (index) => {
    const newPricingTiers = formData.pricingTiers.map((tier, i) => ({
      ...tier,
      isDefault: i === index
    }));
    setFormData(prev => ({
      ...prev,
      pricingTiers: newPricingTiers
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Service name must be at least 2 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Validate pricing tiers
    const validPricingTiers = formData.pricingTiers.filter(tier => 
      tier.name.trim() !== '' && tier.price.trim() !== '' && tier.duration.trim() !== ''
    );
    if (validPricingTiers.length === 0) {
      newErrors.pricingTiers = 'At least one pricing tier is required';
    }

    // Validate each pricing tier
    formData.pricingTiers.forEach((tier, index) => {
      if (tier.name.trim() === '') {
        newErrors[`pricingTier_${index}_name`] = 'Tier name is required';
      }
      if (tier.price.trim() === '') {
        newErrors[`pricingTier_${index}_price`] = 'Price is required';
      }
      if (tier.duration.trim() === '') {
        newErrors[`pricingTier_${index}_duration`] = 'Duration is required';
      }
    });

    // Validate requirements
    const validRequirements = formData.requirements.filter(req => req.trim() !== '');
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty requirements
      const validRequirements = formData.requirements.filter(req => req.trim() !== '');
      const submitData = {
        ...formData,
        requirements: validRequirements
      };
      
      // Handle form submission - API call will go here
      console.log('Form submitted:', submitData);
      onClose();
    }
  };

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
                    <Settings className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Add New Service</h3>
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
                {/* Service Name */}
                <div>
                  <label className="label">Service Name *</label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter service name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="label">Category *</label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.categoryId ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the service and what it includes..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Pricing Tiers */}
                <div>
                  <label className="label">Pricing Tiers *</label>
                  <div className="space-y-4">
                    {formData.pricingTiers.map((tier, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            Pricing Tier {index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="defaultTier"
                                checked={tier.isDefault}
                                onChange={() => setDefaultPricingTier(index)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-600">Default</span>
                            </label>
                            {formData.pricingTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePricingTier(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="label">Tier Name</label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => handlePricingTierChange(index, 'name', e.target.value)}
                              className={`input-field ${errors[`pricingTier_${index}_name`] ? 'border-red-500' : ''}`}
                              placeholder="e.g., Regular, Express"
                            />
                            {errors[`pricingTier_${index}_name`] && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors[`pricingTier_${index}_name`]}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="label">Price</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                value={tier.price}
                                onChange={(e) => handlePricingTierChange(index, 'price', e.target.value)}
                                className={`input-field pl-10 ${errors[`pricingTier_${index}_price`] ? 'border-red-500' : ''}`}
                                placeholder="e.g., $150.00"
                              />
                            </div>
                            {errors[`pricingTier_${index}_price`] && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors[`pricingTier_${index}_price`]}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="label">Duration</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                value={tier.duration}
                                onChange={(e) => handlePricingTierChange(index, 'duration', e.target.value)}
                                className={`input-field pl-10 ${errors[`pricingTier_${index}_duration`] ? 'border-red-500' : ''}`}
                                placeholder="e.g., 2-3 weeks"
                              />
                            </div>
                            {errors[`pricingTier_${index}_duration`] && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors[`pricingTier_${index}_duration`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addPricingTier}
                      className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Pricing Tier
                    </button>
                    
                    {errors.pricingTiers && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.pricingTiers}
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="label">Requirements *</label>
                  <div className="space-y-2">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          className="input-field flex-1"
                          placeholder="Enter requirement"
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Requirement
                    </button>
                  </div>
                  {errors.requirements && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.requirements}
                    </p>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active service
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Active services will be available for selection when creating applications.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto sm:ml-3"
              >
                Create Service
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

export default NewServiceModal;
