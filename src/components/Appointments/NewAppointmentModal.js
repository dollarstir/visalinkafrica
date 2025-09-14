import React, { useState } from 'react';
import { X, User, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const NewAppointmentModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    service: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: '60',
    location: 'Office - Room A',
    staffMember: '',
    notes: '',
    reminderEnabled: true
  });

  const [errors, setErrors] = useState({});

  // Mock data - replace with API calls
  const customers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com' }
  ];

  const services = [
    'Visa Consultation',
    'Document Review',
    'Application Submission',
    'Follow-up Consultation',
    'Initial Consultation',
    'Passport Application',
    'Birth Certificate',
    'School Application'
  ];

  const staffMembers = [
    { id: '1', name: 'Sarah Wilson' },
    { id: '2', name: 'Mike Johnson' },
    { id: '3', name: 'Lisa Davis' },
    { id: '4', name: 'David Brown' }
  ];

  const locations = [
    'Office - Room A',
    'Office - Room B',
    'Office - Room C',
    'Conference Room',
    'Video Call'
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.service) newErrors.service = 'Service is required';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';
    if (!formData.staffMember) newErrors.staffMember = 'Staff member is required';

    // Validate date is not in the past
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }

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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Schedule New Appointment</h3>
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

                {/* Service */}
                <div>
                  <label className="label">Service *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.service ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service} value={service}>
                          {service}
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

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Appointment Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`input-field pl-10 ${errors.appointmentDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.appointmentDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.appointmentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Appointment Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="time"
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.appointmentTime ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.appointmentTime && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.appointmentTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Duration (minutes)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                      >
                        {locations.map(location => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Staff Member */}
                <div>
                  <label className="label">Assign to Staff Member *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="staffMember"
                      value={formData.staffMember}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.staffMember ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select staff member</option>
                      {staffMembers.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.staffMember && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.staffMember}
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
                    placeholder="Additional notes or special requirements..."
                  />
                </div>

                {/* Reminder Settings */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Send reminder notification to customer
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto sm:ml-3"
              >
                Schedule Appointment
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

export default NewAppointmentModal;

