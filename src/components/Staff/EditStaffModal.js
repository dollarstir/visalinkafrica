import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Calendar, MapPin, DollarSign, Clock, Briefcase, Lock, Link2, Unlink } from 'lucide-react';
import apiService from '../../services/api';
import { showError } from '../../utils/toast';

const EditStaffModal = ({ staff, onClose, onSave }) => {
  // Format date for date input (YYYY-MM-DD)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hireDate: '',
    salary: '',
    status: 'Active',
    location: '',
    workingHours: '9:00 AM - 5:00 PM'
  });

  const [errors, setErrors] = useState({});
  const [linkedUserId, setLinkedUserId] = useState(null);
  const [linkedUserEmail, setLinkedUserEmail] = useState(null);
  const [showLinkUserSection, setShowLinkUserSection] = useState(false);
  const [linkUserMode, setLinkUserMode] = useState('create'); // 'create' or 'link'
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkConfirmPassword, setLinkConfirmPassword] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        phone: staff.phone || '',
        position: staff.position || '',
        department: staff.department || '',
        hireDate: formatDate(staff.hireDate),
        salary: staff.salary || '',
        status: staff.status ? staff.status.charAt(0).toUpperCase() + staff.status.slice(1) : 'Active',
        location: staff.location || '',
        workingHours: staff.workingHours || '9:00 AM - 5:00 PM'
      });
      
      // Set linked user info
      setLinkedUserId(staff.userId || null);
      if (staff.userId) {
        loadLinkedUserInfo(staff.userId);
      }
    }
  }, [staff]);

  const loadLinkedUserInfo = async (userId) => {
    try {
      const response = await apiService.getUser(userId);
      if (response.user) {
        setLinkedUserEmail(response.user.email);
      }
    } catch (err) {
      console.error('Error loading linked user info:', err);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      // Load all users so an existing account can be linked; backend will enforce role on save
      const response = await apiService.getUsers({ page: 1, limit: 100 });
      setAvailableUsers(response.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      showError('Failed to load available users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLinkUserClick = () => {
    setShowLinkUserSection(true);
    if (linkUserMode === 'link') {
      loadAvailableUsers();
    }
  };

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.hireDate.trim()) {
      newErrors.hireDate = 'Hire date is required';
    }
    if (!formData.salary.trim()) {
      newErrors.salary = 'Salary is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Format date for API
        const formatDate = (dateStr) => {
          if (!dateStr) return null;
          // If already in YYYY-MM-DD format, return as is
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
          // Otherwise try to parse and format
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return null;
          return date.toISOString().split('T')[0];
        };

        // Prepare data for API
        const staffData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          hire_date: formatDate(formData.hireDate),
          salary: formData.salary,
          status: formData.status ? formData.status.toLowerCase() : 'active',
          location: formData.location,
          working_hours: formData.workingHours,
          total_applications: staff?.totalApplications || 0,
          current_workload: staff?.currentWorkload ? staff.currentWorkload.toLowerCase() : 'low'
        };

        // Handle user account linking
        if (showLinkUserSection) {
          if (linkUserMode === 'create') {
            // Create new user account
            if (!linkPassword || linkPassword.length < 6) {
              setErrors({ ...errors, linkPassword: 'Password must be at least 6 characters' });
              return;
            }
            if (linkPassword !== linkConfirmPassword) {
              setErrors({ ...errors, linkConfirmPassword: 'Passwords do not match' });
              return;
            }
            staffData.create_user_account = true;
            staffData.password = linkPassword;
          } else if (linkUserMode === 'link' && selectedUserId) {
            // Link existing user account
            staffData.user_id = parseInt(selectedUserId);
          }
        } else if (linkedUserId === null && staff?.userId) {
          // User clicked unlink - set user_id to null
          staffData.user_id = null;
        } else if (linkedUserId) {
          // Keep existing link
          staffData.user_id = linkedUserId;
        }

        if (onSave) {
          await onSave(staffData);
        }
      } catch (err) {
        console.error('Error updating staff:', err);
      }
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const departmentOptions = [
    'Consultation',
    'Documentation',
    'Customer Service',
    'Administration',
    'Management'
  ];

  const positionOptions = [
    'Senior Consultant',
    'Junior Consultant',
    'Document Specialist',
    'Customer Service Rep',
    'Administrative Assistant',
    'Manager',
    'Director'
  ];

  const locationOptions = [
    'Main Office',
    'Branch Office A',
    'Branch Office B',
    'Remote',
    'Other'
  ];

  const workingHoursOptions = [
    '8:00 AM - 4:00 PM',
    '8:30 AM - 4:30 PM',
    '9:00 AM - 5:00 PM',
    '9:00 AM - 6:00 PM',
    '10:00 AM - 6:00 PM',
    'Flexible Hours'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Staff Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="label">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Position *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.position ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select position</option>
                    {positionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="label">Department *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.department ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Hire Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.hireDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.hireDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.hireDate}</p>
                )}
              </div>

              <div>
                <label className="label">Salary *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.salary ? 'border-red-500' : ''}`}
                    placeholder="Enter salary"
                  />
                </div>
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="label">Working Hours</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                >
                  {workingHoursOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* User Account Linking Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">User Account</h3>
              {linkedUserId ? (
                <button
                  type="button"
                  onClick={() => {
                    setLinkedUserId(null);
                    setLinkedUserEmail(null);
                    setShowLinkUserSection(false);
                    // When unlinking, we'll set user_id to null in the submit handler
                  }}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
                >
                  <Unlink className="h-4 w-4" />
                  <span>Unlink Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLinkUserClick}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                >
                  <Link2 className="h-4 w-4" />
                  <span>Link User Account</span>
                </button>
              )}
            </div>

            {linkedUserId && linkedUserEmail && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">User Account Linked</p>
                    <p className="text-sm text-green-700">{linkedUserEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {showLinkUserSection && !linkedUserId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkUserMode('create');
                      setSelectedUserId('');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      linkUserMode === 'create'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    Create New Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkUserMode('link');
                      loadAvailableUsers();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      linkUserMode === 'link'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    Link Existing Account
                  </button>
                </div>

                {linkUserMode === 'create' && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          value={linkPassword}
                          onChange={(e) => {
                            setLinkPassword(e.target.value);
                            if (errors.linkPassword) {
                              setErrors({ ...errors, linkPassword: '' });
                            }
                          }}
                          className={`input-field pl-10 ${errors.linkPassword ? 'border-red-500' : ''}`}
                          placeholder="Enter password (min 6 characters)"
                        />
                      </div>
                      {errors.linkPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.linkPassword}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          value={linkConfirmPassword}
                          onChange={(e) => {
                            setLinkConfirmPassword(e.target.value);
                            if (errors.linkConfirmPassword) {
                              setErrors({ ...errors, linkConfirmPassword: '' });
                            }
                          }}
                          className={`input-field pl-10 ${errors.linkConfirmPassword ? 'border-red-500' : ''}`}
                          placeholder="Confirm password"
                        />
                      </div>
                      {errors.linkConfirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.linkConfirmPassword}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      A new user account will be created with email: <strong>{formData.email}</strong> and role: <strong>Staff</strong>
                    </p>
                  </div>
                )}

                {linkUserMode === 'link' && (
                  <div>
                    <label className="label">Select User Account</label>
                    {loadingUsers ? (
                      <p className="text-sm text-gray-600">Loading users...</p>
                    ) : (
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select a user account</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    )}
                    {availableUsers.length === 0 && !loadingUsers && (
                      <p className="text-sm text-gray-600 mt-2">
                        No available staff user accounts found. Create a new account instead.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowLinkUserSection(false);
                    setLinkPassword('');
                    setLinkConfirmPassword('');
                    setSelectedUserId('');
                    setErrors({ ...errors, linkPassword: '', linkConfirmPassword: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}
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

export default EditStaffModal;




