import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Mail, 
  MessageSquare, 
  Bell,
  Key,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  FileText,
  Settings2
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    sms: {
      enabled: false,
      api_key: '',
      sender_name: 'VisaLink'
    },
    email: {
      enabled: false,
      smtp_host: '',
      smtp_port: '',
      smtp_user: '',
      smtp_password: '',
      from_email: '',
      from_name: 'VisaLink Africa'
    },
    sms_templates: {
      application_created_customer: '',
      application_created_agent: '',
      application_status_change_customer: '',
      application_status_change_agent: '',
      appointment_created: '',
      appointment_reminder: '',
      customer_welcome: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('configuration'); // 'configuration' or 'templates'

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      const loadedSettings = response.settings || {};

      setSettings({
        sms: {
          enabled: loadedSettings.sms?.enabled?.value === 'true' || loadedSettings.sms?.enabled?.value === true,
          api_key: loadedSettings.sms?.api_key?.value || '',
          sender_name: loadedSettings.sms?.sender_name?.value || 'VisaLink'
        },
        email: {
          enabled: loadedSettings.email?.enabled?.value === 'true' || loadedSettings.email?.enabled?.value === true,
          smtp_host: loadedSettings.email?.smtp_host?.value || '',
          smtp_port: loadedSettings.email?.smtp_port?.value || '',
          smtp_user: loadedSettings.email?.smtp_user?.value || '',
          smtp_password: loadedSettings.email?.smtp_password?.value || '',
          from_email: loadedSettings.email?.from_email?.value || '',
          from_name: loadedSettings.email?.from_name?.value || 'VisaLink Africa'
        },
        sms_templates: {
          application_created_customer: loadedSettings.sms_templates?.application_created_customer?.value || '',
          application_created_agent: loadedSettings.sms_templates?.application_created_agent?.value || '',
          application_status_change_customer: loadedSettings.sms_templates?.application_status_change_customer?.value || '',
          application_status_change_agent: loadedSettings.sms_templates?.application_status_change_agent?.value || '',
          appointment_created: loadedSettings.sms_templates?.appointment_created?.value || '',
          appointment_reminder: loadedSettings.sms_templates?.appointment_reminder?.value || '',
          customer_welcome: loadedSettings.sms_templates?.customer_welcome?.value || ''
        }
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (category, key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (!newSettings[category]) {
        newSettings[category] = {};
      }
      newSettings[category] = {
        ...newSettings[category],
        [key]: value
      };
      return newSettings;
    });
    
    // Clear error when user starts typing
    if (errors[`${category}.${key}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${category}.${key}`];
        return newErrors;
      });
    }
  };

  const handleToggle = (category, key) => {
    handleInputChange(category, key, !settings[category][key]);
  };

  const validateSettings = () => {
    const newErrors = {};

    // Validate SMS settings if enabled
    if (settings.sms.enabled) {
      if (!settings.sms.api_key || settings.sms.api_key.trim() === '') {
        newErrors['sms.api_key'] = 'API Key is required when SMS is enabled';
      }
      if (!settings.sms.sender_name || settings.sms.sender_name.trim() === '') {
        newErrors['sms.sender_name'] = 'Sender Name is required';
      }
    }

    // Validate Email settings if enabled
    if (settings.email.enabled) {
      if (!settings.email.smtp_host || settings.email.smtp_host.trim() === '') {
        newErrors['email.smtp_host'] = 'SMTP Host is required when Email is enabled';
      }
      if (!settings.email.smtp_port || settings.email.smtp_port.trim() === '') {
        newErrors['email.smtp_port'] = 'SMTP Port is required when Email is enabled';
      }
      if (!settings.email.smtp_user || settings.email.smtp_user.trim() === '') {
        newErrors['email.smtp_user'] = 'SMTP Username is required when Email is enabled';
      }
      if (!settings.email.smtp_password || settings.email.smtp_password.trim() === '') {
        newErrors['email.smtp_password'] = 'SMTP Password is required when Email is enabled';
      }
      if (!settings.email.from_email || settings.email.from_email.trim() === '') {
        newErrors['email.from_email'] = 'From Email is required when Email is enabled';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      showError('Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);

      // Prepare settings array for API
      const settingsArray = [
        // SMS settings
        { key: 'sms.enabled', value: settings.sms.enabled.toString() },
        { key: 'sms.api_key', value: settings.sms.api_key },
        { key: 'sms.sender_name', value: settings.sms.sender_name },
        // Email settings
        { key: 'email.enabled', value: settings.email.enabled.toString() },
        { key: 'email.smtp_host', value: settings.email.smtp_host },
        { key: 'email.smtp_port', value: settings.email.smtp_port },
        { key: 'email.smtp_user', value: settings.email.smtp_user },
        { key: 'email.smtp_password', value: settings.email.smtp_password },
        { key: 'email.from_email', value: settings.email.from_email },
        { key: 'email.from_name', value: settings.email.from_name },
        // SMS Templates
        { key: 'sms_templates.application_created_customer', value: settings.sms_templates.application_created_customer },
        { key: 'sms_templates.application_created_agent', value: settings.sms_templates.application_created_agent },
        { key: 'sms_templates.application_status_change_customer', value: settings.sms_templates.application_status_change_customer },
        { key: 'sms_templates.application_status_change_agent', value: settings.sms_templates.application_status_change_agent },
        { key: 'sms_templates.appointment_created', value: settings.sms_templates.appointment_created },
        { key: 'sms_templates.appointment_reminder', value: settings.sms_templates.appointment_reminder },
        { key: 'sms_templates.customer_welcome', value: settings.sms_templates.customer_welcome }
      ];

      await apiService.updateSettings(settingsArray);
      showSuccess('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      showError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Check permission after all hooks
  if (!hasPermission(user, 'settings.view') && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  // Template definitions with available variables
  const templateDefinitions = {
    application_created_customer: {
      name: 'Application Created - Customer',
      description: 'SMS sent to customer when application is created',
      variables: ['customer_name', 'application_id', 'service_name', 'sender_name']
    },
    application_created_agent: {
      name: 'Application Created - Agent',
      description: 'SMS sent to agent when they create an application',
      variables: ['agent_name', 'application_id', 'customer_name', 'service_name', 'sender_name']
    },
    application_status_change_customer: {
      name: 'Application Status Change - Customer',
      description: 'SMS sent to customer when application status changes',
      variables: ['customer_name', 'application_id', 'service_name', 'status_message', 'sender_name']
    },
    application_status_change_agent: {
      name: 'Application Status Change - Agent',
      description: 'SMS sent to agent when application status changes',
      variables: ['agent_name', 'application_id', 'customer_name', 'service_name', 'status_message', 'sender_name']
    },
    appointment_created: {
      name: 'Appointment Created',
      description: 'SMS sent to customer when appointment is created',
      variables: ['customer_name', 'service', 'appointment_date', 'appointment_time', 'location_text', 'sender_name']
    },
    appointment_reminder: {
      name: 'Appointment Reminder',
      description: 'SMS reminder sent to customer before appointment',
      variables: ['customer_name', 'service', 'appointment_date', 'appointment_time', 'sender_name']
    },
    customer_welcome: {
      name: 'Customer Welcome',
      description: 'Welcome SMS sent to customer when they are created',
      variables: ['customer_name', 'sender_name']
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure SMS and Email notification settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('configuration')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'configuration'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings2 className="h-4 w-4" />
              <span>Configuration</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>SMS Templates</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <>
      {/* SMS Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SMS Notifications</h2>
        </div>

        <div className="space-y-4">
          {/* Enable SMS */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable SMS Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send SMS notifications to customers</p>
            </div>
            <button
              onClick={() => handleToggle('sms', 'enabled')}
              className="focus:outline-none"
            >
              {settings.sms.enabled ? (
                <ToggleRight className="h-8 w-8 text-primary-600" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>

          {settings.sms.enabled && (
            <>
              {/* API Key */}
              <div>
                <label className="label">mNotify API Key *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={settings.sms.api_key}
                    onChange={(e) => handleInputChange('sms', 'api_key', e.target.value)}
                    className={`input-field pl-10 ${errors['sms.api_key'] ? 'border-red-500' : ''}`}
                    placeholder="Enter your mNotify API key"
                  />
                </div>
                {errors['sms.api_key'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['sms.api_key']}
                  </p>
                )}
              </div>

              {/* Sender Name */}
              <div>
                <label className="label">Sender Name *</label>
                <input
                  type="text"
                  value={settings.sms.sender_name}
                  onChange={(e) => handleInputChange('sms', 'sender_name', e.target.value)}
                  className={`input-field ${errors['sms.sender_name'] ? 'border-red-500' : ''}`}
                  placeholder="VisaLink"
                  maxLength={11}
                />
                {errors['sms.sender_name'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['sms.sender_name']}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maximum 11 characters (appears as SMS sender)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
        </div>

        <div className="space-y-4">
          {/* Enable Email */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Email Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send email notifications to customers</p>
            </div>
            <button
              onClick={() => handleToggle('email', 'enabled')}
              className="focus:outline-none"
            >
              {settings.email.enabled ? (
                <ToggleRight className="h-8 w-8 text-primary-600" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>

          {settings.email.enabled && (
            <>
              {/* SMTP Host */}
              <div>
                <label className="label">SMTP Host *</label>
                <input
                  type="text"
                  value={settings.email.smtp_host}
                  onChange={(e) => handleInputChange('email', 'smtp_host', e.target.value)}
                  className={`input-field ${errors['email.smtp_host'] ? 'border-red-500' : ''}`}
                  placeholder="smtp.gmail.com"
                />
                {errors['email.smtp_host'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['email.smtp_host']}
                  </p>
                )}
              </div>

              {/* SMTP Port */}
              <div>
                <label className="label">SMTP Port *</label>
                <input
                  type="number"
                  value={settings.email.smtp_port}
                  onChange={(e) => handleInputChange('email', 'smtp_port', e.target.value)}
                  className={`input-field ${errors['email.smtp_port'] ? 'border-red-500' : ''}`}
                  placeholder="587"
                />
                {errors['email.smtp_port'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['email.smtp_port']}
                  </p>
                )}
              </div>

              {/* SMTP Username */}
              <div>
                <label className="label">SMTP Username *</label>
                <input
                  type="text"
                  value={settings.email.smtp_user}
                  onChange={(e) => handleInputChange('email', 'smtp_user', e.target.value)}
                  className={`input-field ${errors['email.smtp_user'] ? 'border-red-500' : ''}`}
                  placeholder="your-email@gmail.com"
                />
                {errors['email.smtp_user'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['email.smtp_user']}
                  </p>
                )}
              </div>

              {/* SMTP Password */}
              <div>
                <label className="label">SMTP Password *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={settings.email.smtp_password}
                    onChange={(e) => handleInputChange('email', 'smtp_password', e.target.value)}
                    className={`input-field pl-10 ${errors['email.smtp_password'] ? 'border-red-500' : ''}`}
                    placeholder="Enter SMTP password"
                  />
                </div>
                {errors['email.smtp_password'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['email.smtp_password']}
                  </p>
                )}
              </div>

              {/* From Email */}
              <div>
                <label className="label">From Email *</label>
                <input
                  type="email"
                  value={settings.email.from_email}
                  onChange={(e) => handleInputChange('email', 'from_email', e.target.value)}
                  className={`input-field ${errors['email.from_email'] ? 'border-red-500' : ''}`}
                  placeholder="noreply@visalink.com"
                />
                {errors['email.from_email'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['email.from_email']}
                  </p>
                )}
              </div>

              {/* From Name */}
              <div>
                <label className="label">From Name</label>
                <input
                  type="text"
                  value={settings.email.from_name}
                  onChange={(e) => handleInputChange('email', 'from_name', e.target.value)}
                  className="input-field"
                  placeholder="VisaLink Africa"
                />
              </div>
            </>
          )}
        </div>
      </div>
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SMS Templates</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Customize SMS messages sent to customers and agents. Use variables like {'{{customer_name}}'}, {'{{application_id}}'}, etc.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(templateDefinitions).map(([key, template]) => (
                <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Available variables:</span>
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                        >
                          {'{{' + variable + '}}'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={settings.sms_templates[key] || ''}
                    onChange={(e) => handleInputChange('sms_templates', key, e.target.value)}
                    className="w-full input-field font-mono text-sm"
                    rows={4}
                    placeholder={`Enter template for ${template.name}...`}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use double curly braces {'{{variable}}'} to insert dynamic values
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

