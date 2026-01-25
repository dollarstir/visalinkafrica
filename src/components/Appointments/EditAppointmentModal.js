import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, Calendar, Clock, MapPin, FileText, UserCheck, Bell } from 'lucide-react';

const EditAppointmentModal = ({ appointment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: appointment?.customerName || '',
    customerEmail: appointment?.customerEmail || '',
    customerPhone: appointment?.customerPhone || '',
    service: appointment?.service || '',
    appointmentDate: appointment?.appointmentDate || '',
    appointmentTime: appointment?.appointmentTime || '',
    duration: appointment?.duration || '60 minutes',
    status: appointment?.status || 'Pending',
    staffMember: appointment?.staffMember || '',
    location: appointment?.location || '',
    notes: appointment?.notes || '',
    reminderSent: appointment?.reminderSent || false
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
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }
    if (!formData.service.trim()) {
      newErrors.service = 'Service is required';
    }
    if (!formData.appointmentDate.trim()) {
      newErrors.appointmentDate = 'Appointment date is required';
    }
    if (!formData.appointmentTime.trim()) {
      newErrors.appointmentTime = 'Appointment time is required';
    }
    if (!formData.staffMember.trim()) {
      newErrors.staffMember = 'Staff member is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Completed', label: 'Completed' }
  ];

  const serviceOptions = [
    'Visa Consultation',
    'Document Review',
    'Application Submission',
    'Follow-up Consultation',
    'Payment Processing',
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
          <h2 className="text-xl font-semibold text-gray-900">Edit Appointment</h2>
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

            <div>
              <label className="label">Customer Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.customerPhone ? 'border-red-500' : ''}`}
                  placeholder="Enter customer phone number"
                />
              </div>
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Appointment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Appointment Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Service *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.service ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select service</option>
                    {serviceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {errors.service && (
                  <p className="mt-1 text-sm text-red-600">{errors.service}</p>
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
                <label className="label">Appointment Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.appointmentDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                )}
              </div>

              <div>
                <label className="label">Appointment Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.appointmentTime ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
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
              <label className="label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Enter any additional notes..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="reminderSent"
                checked={formData.reminderSent}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Reminder sent
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

export default EditAppointmentModal;




