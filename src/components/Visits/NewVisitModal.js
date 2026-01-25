import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import { showError } from '../../utils/toast';

const NewVisitModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    visitorId: '',
    visitType: '',
    visitDate: '',
    visitTime: '',
    duration: '60',
    location: 'Office - Room A',
    staffMember: '',
    purpose: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [visitors, setVisitors] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load visitors and staff on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [visitorsRes, staffRes] = await Promise.all([
          apiService.getVisitors({ limit: 100, page: 1 }),
          apiService.getStaff({ limit: 100, page: 1 })
        ]);
        
        setVisitors(visitorsRes.visitors || []);
        setStaffMembers(staffRes.staff || []);
      } catch (err) {
        console.error('Error loading data:', err);
        showError('Failed to load visitors and staff. Please try again.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const visitTypes = [
    'Initial Consultation',
    'Follow-up Consultation',
    'Document Review',
    'Application Submission',
    'Status Update',
    'Payment Processing',
    'Other'
  ];

  const locations = [
    'Office - Room A',
    'Office - Room B',
    'Office - Room C',
    'Conference Room',
    'Video Call'
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
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

    if (!formData.visitorId) {
      newErrors.visitorId = 'Visitor is required';
    }

    if (!formData.visitType) {
      newErrors.visitType = 'Visit type is required';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    if (!formData.visitTime) {
      newErrors.visitTime = 'Visit time is required';
    }

    if (!formData.staffMember) {
      newErrors.staffMember = 'Staff member is required';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    // Validate date is not in the past
    if (formData.visitDate) {
      const selectedDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.visitDate = 'Visit date cannot be in the past';
      }
    }

    // Validate follow-up date if required
    if (formData.followUpRequired && formData.followUpDate) {
      const followUpDate = new Date(formData.followUpDate);
      const visitDate = new Date(formData.visitDate);
      if (followUpDate <= visitDate) {
        newErrors.followUpDate = 'Follow-up date must be after visit date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for API
      const selectedVisitor = visitors.find(v => String(v.id) === String(formData.visitorId));
      const selectedStaff = staffMembers.find(s => String(s.id) === String(formData.staffMember));
      
      const visitData = {
        customer_name: selectedVisitor ? `${selectedVisitor.first_name} ${selectedVisitor.last_name}`.trim() : '',
        customer_email: selectedVisitor ? selectedVisitor.email : '',
        visit_type: formData.visitType,
        visit_date: formData.visitDate,
        visit_time: formData.visitTime,
        duration: formData.duration,
        staff_member: selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}`.trim() : '',
        location: formData.location,
        purpose: formData.purpose,
        outcome: formData.outcome,
        follow_up_required: formData.followUpRequired,
        notes: formData.notes
      };

      // Call the onSave prop (which will make the API call)
      if (onSave) {
        onSave(visitData);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Schedule New Visit</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer and Visit Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Visitor *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      {loadingData ? (
                        <select className="input-field pl-10" disabled>
                          <option>Loading visitors...</option>
                        </select>
                      ) : (
                        <>
                          <select
                            name="visitorId"
                            value={formData.visitorId}
                            onChange={handleInputChange}
                            className={`input-field pl-10 ${errors.visitorId ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select a visitor</option>
                            {visitors.map(visitor => (
                              <option key={visitor.id} value={String(visitor.id)}>
                                {visitor.first_name} {visitor.last_name} ({visitor.email})
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                    {errors.visitorId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.visitorId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Visit Type *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="visitType"
                        value={formData.visitType}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.visitType ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select visit type</option>
                        {visitTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.visitType && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.visitType}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Visit Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`input-field pl-10 ${errors.visitDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.visitDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.visitDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Visit Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="time"
                        name="visitTime"
                        value={formData.visitTime}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.visitTime ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.visitTime && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.visitTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Duration</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                      >
                        {durationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
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
                  <label className="label">Assigned Staff Member *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    {loadingData ? (
                      <select className="input-field pl-10" disabled>
                        <option>Loading staff...</option>
                      </select>
                    ) : (
                      <select
                        name="staffMember"
                        value={formData.staffMember}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.staffMember ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select staff member</option>
                        {staffMembers.map(staff => (
                          <option key={staff.id} value={String(staff.id)}>
                            {staff.first_name} {staff.last_name} - {staff.position}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {errors.staffMember && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.staffMember}
                    </p>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label className="label">Purpose *</label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows={3}
                    className={`input-field ${errors.purpose ? 'border-red-500' : ''}`}
                    placeholder="Describe the purpose of this visit..."
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.purpose}
                    </p>
                  )}
                </div>

                {/* Visit Outcome */}
                <div>
                  <label className="label">Visit Outcome</label>
                  <textarea
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    placeholder="Describe the outcome of the visit (can be filled after the visit)..."
                  />
                </div>

                {/* Follow-up Required */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="followUpRequired"
                      checked={formData.followUpRequired}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Follow-up visit required
                    </label>
                  </div>

                  {formData.followUpRequired && (
                    <div>
                      <label className="label">Follow-up Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="followUpDate"
                          value={formData.followUpDate}
                          onChange={handleInputChange}
                          min={formData.visitDate || new Date().toISOString().split('T')[0]}
                          className={`input-field pl-10 ${errors.followUpDate ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.followUpDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.followUpDate}
                        </p>
                      )}
                    </div>
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
                    placeholder="Additional notes about the visit..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto sm:ml-3"
              >
                Schedule Visit
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

export default NewVisitModal;


