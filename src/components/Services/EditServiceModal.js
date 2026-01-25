import React, { useState, useEffect } from 'react';
import { X, Save, Settings, FolderOpen, Coins, Clock, FileText, Plus, Trash2 } from 'lucide-react';
import apiService from '../../services/api';
import { showError } from '../../utils/toast';

const EditServiceModal = ({ service, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    category: service?.category || '',
    categoryId: service?.categoryId || '',
    description: service?.description || '',
    pricingTiers: service?.pricingTiers || [
      { name: 'Regular', price: '', duration: '', isDefault: true }
    ],
    isActive: service?.isActive ?? true,
    requirements: service?.requirements || []
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    loadCategories();
    // Update form data when service prop changes
    if (service) {
      // Parse pricing_tiers if needed
      let pricingTiers = [];
      if (service.pricingTiers) {
        if (Array.isArray(service.pricingTiers)) {
          pricingTiers = service.pricingTiers;
        } else if (typeof service.pricingTiers === 'string') {
          try {
            pricingTiers = JSON.parse(service.pricingTiers);
          } catch (e) {
            console.error('Error parsing pricingTiers:', e);
          }
        }
      }

      // Ensure requirements is an array
      const requirements = Array.isArray(service.requirements) ? service.requirements : [];

      setFormData({
        name: service.name || '',
        category: service.category || '',
        categoryId: service.categoryId ? String(service.categoryId) : '',
        description: service.description || '',
        pricingTiers: pricingTiers.length > 0 ? pricingTiers : [{ name: 'Regular', price: '', duration: '', isDefault: true }],
        isActive: service.isActive !== false,
        requirements: requirements
      });
      
      console.log('EditServiceModal - Initialized form data:', {
        service: service,
        categoryId: service.categoryId,
        pricingTiers: pricingTiers,
        formData: {
          categoryId: service.categoryId ? String(service.categoryId) : '',
          pricingTiers: pricingTiers.length > 0 ? pricingTiers : [{ name: 'Regular', price: '', duration: '', isDefault: true }]
        }
      });
    }
  }, [service]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiService.getServiceCategories({ page: 1, limit: 100 });
      const categoryOptions = (response.categories || []).map(cat => ({
        id: cat.id.toString(),
        name: cat.name
      }));
      setCategories(categoryOptions);
    } catch (err) {
      console.error('Error loading categories:', err);
      showError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const handlePricingTierChange = (index, field, value) => {
    const updatedTiers = [...formData.pricingTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setFormData(prev => ({ ...prev, pricingTiers: updatedTiers }));
  };

  const handleSetDefaultTier = (index) => {
    const updatedTiers = formData.pricingTiers.map((tier, i) => ({
      ...tier,
      isDefault: i === index
    }));
    setFormData(prev => ({ ...prev, pricingTiers: updatedTiers }));
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [...prev.pricingTiers, { name: '', price: '', duration: '', isDefault: false }]
    }));
  };

  const removePricingTier = (index) => {
    if (formData.pricingTiers.length > 1) {
      const updatedTiers = formData.pricingTiers.filter((_, i) => i !== index);
      // If we removed the default tier, make the first one default
      if (updatedTiers.length > 0 && !updatedTiers.some(tier => tier.isDefault)) {
        updatedTiers[0].isDefault = true;
      }
      setFormData(prev => ({ ...prev, pricingTiers: updatedTiers }));
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirementToRemove) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!formData.categoryId) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.pricingTiers.length === 0) {
      newErrors.pricingTiers = 'At least one pricing tier is required';
    }
    if (formData.requirements.length === 0) {
      newErrors.requirements = 'At least one requirement is required';
    }

    // Validate pricing tiers
    formData.pricingTiers.forEach((tier, index) => {
      if (!tier.name.trim()) {
        newErrors[`tier_${index}_name`] = 'Tier name is required';
      }
      if (!tier.price.trim()) {
        newErrors[`tier_${index}_price`] = 'Tier price is required';
      }
      if (!tier.duration.trim()) {
        newErrors[`tier_${index}_duration`] = 'Tier duration is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Service Name *</label>
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="label">Category *</label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => {
                      const selectedCategory = categories.find(cat => cat.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        categoryId: e.target.value,
                        category: selectedCategory?.name || ''
                      }));
                    }}
                    className={`input-field pl-10 ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Enter service description..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Service is active
              </label>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Pricing Tiers</h3>
              <button
                type="button"
                onClick={addPricingTier}
                className="btn-outline flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Tier</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.pricingTiers.map((tier, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  tier.isDefault ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Tier {index + 1}</span>
                      {tier.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!tier.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultTier(index)}
                          className="text-xs text-primary-600 hover:text-primary-800"
                        >
                          Set as Default
                        </button>
                      )}
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
                      <label className="label">Tier Name *</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handlePricingTierChange(index, 'name', e.target.value)}
                        className={`input-field ${errors[`tier_${index}_name`] ? 'border-red-500' : ''}`}
                        placeholder="e.g., Regular, Express"
                      />
                      {errors[`tier_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`tier_${index}_name`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="label">Price *</label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={tier.price}
                          onChange={(e) => handlePricingTierChange(index, 'price', e.target.value)}
                          className={`input-field pl-10 ${errors[`tier_${index}_price`] ? 'border-red-500' : ''}`}
                          placeholder="e.g., 150.00"
                        />
                      </div>
                      {errors[`tier_${index}_price`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`tier_${index}_price`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="label">Duration *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={tier.duration}
                          onChange={(e) => handlePricingTierChange(index, 'duration', e.target.value)}
                          className={`input-field pl-10 ${errors[`tier_${index}_duration`] ? 'border-red-500' : ''}`}
                          placeholder="e.g., 2-3 weeks"
                        />
                      </div>
                      {errors[`tier_${index}_duration`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`tier_${index}_duration`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.pricingTiers && (
              <p className="text-sm text-red-600">{errors.pricingTiers}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter requirement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="btn-primary"
                disabled={!newRequirement.trim()}
              >
                Add
              </button>
            </div>

            <div>
              <label className="label">Current Requirements *</label>
              {formData.requirements.length > 0 ? (
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(requirement)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No requirements added yet</p>
                </div>
              )}
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;




