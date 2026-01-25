import React, { useState } from 'react';
import { X, Save, BarChart3, Calendar, Filter, Download, Settings } from 'lucide-react';

const EditReportModal = ({ report, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: report?.title || '',
    type: report?.type || 'overview',
    period: report?.period || '30days',
    dateRange: {
      startDate: report?.dateRange?.startDate || '',
      endDate: report?.dateRange?.endDate || ''
    },
    filters: {
      includeInactive: report?.filters?.includeInactive || false,
      groupBy: report?.filters?.groupBy || 'month',
      sortBy: report?.filters?.sortBy || 'date'
    },
    format: report?.format || 'pdf',
    schedule: {
      enabled: report?.schedule?.enabled || false,
      frequency: report?.schedule?.frequency || 'weekly',
      day: report?.schedule?.day || 'monday',
      time: report?.schedule?.time || '09:00'
    }
  });

  const [errors, setErrors] = useState({});

  const reportTypes = [
    { value: 'overview', label: 'Overview Report' },
    { value: 'applications', label: 'Applications Report' },
    { value: 'staff', label: 'Staff Performance Report' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'customers', label: 'Customer Report' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const groupByOptions = [
    { value: 'day', label: 'By Day' },
    { value: 'week', label: 'By Week' },
    { value: 'month', label: 'By Month' },
    { value: 'quarter', label: 'By Quarter' },
    { value: 'year', label: 'By Year' }
  ];

  const sortByOptions = [
    { value: 'date', label: 'Date' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'applications', label: 'Applications' },
    { value: 'customers', label: 'Customers' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
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

    if (!formData.title.trim()) {
      newErrors.title = 'Report title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Report type is required';
    }
    if (!formData.period) {
      newErrors.period = 'Period is required';
    }
    if (formData.period === 'custom') {
      if (!formData.dateRange.startDate) {
        newErrors.startDate = 'Start date is required for custom range';
      }
      if (!formData.dateRange.endDate) {
        newErrors.endDate = 'End date is required for custom range';
      }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Report</h2>
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
            
            <div>
              <label className="label">Report Title *</label>
              <div className="relative">
                <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter report title"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Report Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`input-field ${errors.type ? 'border-red-500' : ''}`}
                >
                  {reportTypes.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="label">Export Format</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Time Period</h3>
            
            <div>
              <label className="label">Period *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.period ? 'border-red-500' : ''}`}
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              {errors.period && (
                <p className="mt-1 text-sm text-red-600">{errors.period}</p>
              )}
            </div>

            {formData.period === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input
                    type="date"
                    name="dateRange.startDate"
                    value={formData.dateRange.startDate}
                    onChange={handleInputChange}
                    className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="label">End Date *</label>
                  <input
                    type="date"
                    name="dateRange.endDate"
                    value={formData.dateRange.endDate}
                    onChange={handleInputChange}
                    className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Filters & Grouping</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Group By</label>
                <select
                  name="filters.groupBy"
                  value={formData.filters.groupBy}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {groupByOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Sort By</label>
                <select
                  name="filters.sortBy"
                  value={formData.filters.sortBy}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {sortByOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="filters.includeInactive"
                checked={formData.filters.includeInactive}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Include inactive records
              </label>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Report Scheduling</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="schedule.enabled"
                checked={formData.schedule.enabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Enable automatic report generation
              </label>
            </div>

            {formData.schedule.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Frequency</label>
                  <select
                    name="schedule.frequency"
                    value={formData.schedule.frequency}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {formData.schedule.frequency === 'weekly' && (
                  <div>
                    <label className="label">Day of Week</label>
                    <select
                      name="schedule.day"
                      value={formData.schedule.day}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      {dayOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label">Time</label>
                  <input
                    type="time"
                    name="schedule.time"
                    value={formData.schedule.time}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
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

export default EditReportModal;




