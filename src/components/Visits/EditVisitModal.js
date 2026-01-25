import React, { useState } from 'react';
import { X, Save, User, Mail, Calendar, Clock, MapPin, FileText, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

const EditVisitModal = ({ visit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: visit?.customerName || '',
    customerEmail: visit?.customerEmail || '',
    visitType: visit?.visitType || '',
    visitDate: visit?.visitDate || '',
    visitTime: visit?.visitTime || '',
    duration: visit?.duration || '60 minutes',
    status: visit?.status || 'Scheduled',
    staffMember: visit?.staffMember || '',
    location: visit?.location || '',
    purpose: visit?.purpose || '',
    outcome: visit?.outcome || '',
    followUpRequired: visit?.followUpRequired || false
  });

  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }
    if (!formData.visitType.trim()) {
      newErrors.visitType = 'Visit type is required';
    }
    if (!formData.visitDate.trim()) {
      newErrors.visitDate = 'Visit date is required';
    }
    if (!formData.visitTime.trim()) {
      newErrors.visitTime = 'Visit time is required';
    }
    if (!formData.staffMember.trim()) {
      newErrors.staffMember = 'Staff member is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data for API
      const visitData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        visit_type: formData.visitType,
        visit_date: formData.visitDate,
        visit_time: formData.visitTime,
        duration: formData.duration,
        status: formData.status.toLowerCase().replace(' ', '_'),
        staff_member: formData.staffMember,
        location: formData.location,
        purpose: formData.purpose,
        outcome: formData.outcome,
        follow_up_required: formData.followUpRequired,
        notes: formData.notes
      };

      // Call onSave prop (which will make API call)
      if (onSave) {
        onSave(visitData);
      }
    }
  };

  const statusOptions = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'No Show', label: 'No Show' }
  ];

  const visitTypeOptions = [
    'Consultation',
    'Document Review',
    'Follow-up',
    'Initial Consultation',
    'Application Submission',
    'Payment',
    'Other'
  ];

  const staffOptions = [
    'Sarah Wilson',
    'Mike Johnson',
    'Lisa Davis',
    'David Brown'
  ];

  const locationOptions = [
    'Office - Room A',
    'Office - Room B',
    'Office - Room C',
    'Conference Room',
    'Virtual Meeting',
    'Other'
  ];

  const durationOptions = [
    '30 minutes',
    '45 minutes',
    '60 minutes',
    '90 minutes',
    '120 minutes'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Visit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Customer Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.customerName ? 'border-red-500' : ''}`}
                    placeholder="Enter customer name"
                  />
                </div>
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="label">Customer Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.customerEmail ? 'border-red-500' : ''}`}
                    placeholder="Enter customer email"
                  />
                </div>
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Visit Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Visit Type *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="visitType"
                    value={formData.visitType}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.visitType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select visit type</option>
                    {visitTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {errors.visitType && (
                  <p className="mt-1 text-sm text-red-600">{errors.visitType}</p>
                )}
              </div>

              <div>
                <label className="label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Visit Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.visitDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.visitDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.visitDate}</p>
                )}
              </div>

              <div>
                <label className="label">Visit Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    name="visitTime"
                    value={formData.visitTime}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.visitTime ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.visitTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.visitTime}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Duration</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {durationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.location ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select location</option>
                    {locationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Assigned Staff Member *</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="staffMember"
                  value={formData.staffMember}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.staffMember ? 'border-red-500' : ''}`}
                >
                  <option value="">Select staff member</option>
                  {staffOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {errors.staffMember && (
                <p className="mt-1 text-sm text-red-600">{errors.staffMember}</p>
              )}
            </div>

            <div>
              <label className="label">Purpose *</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                rows={3}
                className={`input-field ${errors.purpose ? 'border-red-500' : ''}`}
                placeholder="Enter visit purpose..."
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
              )}
            </div>

            <div>
              <label className="label">Outcome</label>
              <textarea
                name="outcome"
                value={formData.outcome}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Enter visit outcome..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Follow-up required
              </label>
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

export default EditVisitModal;


