import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const UserProfile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department: '',
    joinDate: '',
    avatar: null
  });

  const [preferences, setPreferences] = useState(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      try {
        return JSON.parse(savedPrefs);
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
    return {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      theme: theme || 'light',
      language: 'en',
      timezone: 'UTC'
    };
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setPreferences(prefs);
        if (prefs.theme) {
          setTheme(prefs.theme);
        }
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Format join date from created_at
      const joinDate = user.created_at 
        ? new Date(user.created_at).toISOString().split('T')[0]
        : '';
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || '',
        department: user.department || '',
        joinDate: joinDate,
        avatar: user.avatar || null
      });
    }
  }, [user]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      const userData = response.user;
      
      // Format join date
      const joinDate = userData.created_at 
        ? new Date(userData.created_at).toISOString().split('T')[0]
        : '';
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        role: userData.role || '',
        department: userData.department || '',
        joinDate: joinDate,
        avatar: userData.avatar || null
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
      showError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
      // Save to localStorage
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      return updated;
    });
  };

  const handleThemeChange = (newTheme) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        theme: newTheme
      };
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      return updated;
    });
    setTheme(newTheme);
    showSuccess('Theme updated successfully');
  };

  const handleLanguageChange = (newLanguage) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        language: newLanguage
      };
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      return updated;
    });
    showSuccess('Language preference saved');
  };

  const handleTimezoneChange = (newTimezone) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        timezone: newTimezone
      };
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      return updated;
    });
    showSuccess('Timezone preference saved');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API (exclude email and role as they shouldn't be changed by user)
      const profileData = {
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null,
        department: formData.department || null
      };
      
      await updateUser(profileData);
      showSuccess('Profile updated successfully');
      setIsEditing(false);
      await loadUserProfile(); // Reload to get latest data
    } catch (err) {
      console.error('Error saving profile:', err);
      showError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data from current user
    const joinDate = user?.created_at 
      ? new Date(user.created_at).toISOString().split('T')[0]
      : '';
    
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      role: user?.role || '',
      department: user?.department || '',
      joinDate: joinDate,
      avatar: user?.avatar || null
    });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showSuccess('Password changed successfully');
      setShowChangePasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      showError(err.message || 'Failed to change password');
    }
  };

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !user) return;

    try {
      setAvatarUploading(true);
      const response = await apiService.uploadUserAvatar(user.id, file);
      const updatedUser = response.user || response;
      const newAvatar = updatedUser.avatar;

      setFormData(prev => ({
        ...prev,
        avatar: newAvatar || null
      }));

      // Update cached auth user so the rest of the app can pick it up on reload
      const cached = { ...(user || {}), avatar: newAvatar };
      localStorage.setItem('visaLink_user', JSON.stringify(cached));

      showSuccess('Profile photo updated');
    } catch (err) {
      console.error('Avatar upload error:', err);
      showError(err.message || 'Failed to upload profile photo');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 dark:bg-gray-900 min-h-screen">
        <div className="card text-center py-12 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
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
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
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
                  <>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={avatarUploading}
                      className="absolute bottom-0 right-0 h-7 w-7 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 disabled:opacity-60"
                      title={avatarUploading ? 'Uploading...' : 'Change profile photo'}
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{formData.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formData.role}</p>
                {avatarUploading && (
                  <p className="text-xs text-gray-500 mt-1">Uploading photo...</p>
                )}
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
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <User className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {formData.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="flex items-center text-gray-900 dark:text-gray-100">
                  <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  {formData.email}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
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
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {formData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="label">Role</label>
                <div className="flex items-center text-gray-900 dark:text-gray-100">
                  <Shield className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  {formData.role}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Role cannot be changed</p>
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
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <Globe className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {formData.department || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Join Date */}
              <div>
                <label className="label">Join Date</label>
                <div className="flex items-center text-gray-900 dark:text-gray-100">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : 'Not available'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Join date cannot be changed</p>
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
                <div className="flex items-start text-gray-900 dark:text-gray-100">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 mt-0.5" />
                  {formData.address || 'Not provided'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button 
                  onClick={handleCancel} 
                  disabled={saving}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
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
              <button 
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full btn-outline flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Lock className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button className="w-full btn-outline flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add extra security to your account</p>
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
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</span>
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
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</span>
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
                  <span className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</span>
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
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Theme</label>
                <select
                  value={preferences.theme || theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="input-field"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {preferences.theme === 'auto' ? 'Following system' : preferences.theme}
                </p>
              </div>

              <div>
                <label className="label">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="input-field"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>

              <div>
                <label className="label">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="input-field"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Africa/Accra">GMT (Ghana)</option>
                  <option value="America/New_York">EST (Eastern Time)</option>
                  <option value="America/Los_Angeles">PST (Pacific Time)</option>
                  <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                  <option value="Africa/Lagos">WAT (West Africa Time)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowChangePasswordModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <button
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input-field"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input-field"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleChangePassword}
                  className="btn-primary w-full sm:w-auto sm:ml-3"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;






