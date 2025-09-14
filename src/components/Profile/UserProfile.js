import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  Camera,
  Bell,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || '',
    department: user?.department || '',
    joinDate: user?.joinDate || '2024-01-01',
    avatar: user?.avatar || null
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'light',
    language: 'en',
    timezone: 'UTC'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      role: user?.role || '',
      department: user?.department || '',
      joinDate: user?.joinDate || '2024-01-01',
      avatar: user?.avatar || null
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-outline flex items-center space-x-2"
        >
          <Edit className="h-5 w-5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            {/* Avatar Section */}
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary-600" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700">
                    <Camera className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{formData.name}</h3>
                <p className="text-sm text-gray-500">{formData.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {formData.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {formData.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {formData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="label">Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    {formData.role}
                  </div>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="label">Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    {formData.department || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Join Date */}
              <div>
                <label className="label">Join Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formData.joinDate}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="label">Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                />
              ) : (
                <div className="flex items-start text-gray-900">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  {formData.address || 'Not provided'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <button className="w-full btn-outline flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your password</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button className="w-full btn-outline flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add extra security to your account</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.sms}
                    onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                  className="input-field"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="label">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="input-field"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className="label">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="input-field"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

