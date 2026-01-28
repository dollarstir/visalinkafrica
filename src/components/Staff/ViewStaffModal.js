import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, DollarSign, Clock, Briefcase, CheckCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import apiService from '../../services/api';

const ViewStaffModal = ({ staff, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    if (staff && staff.id) {
      loadApplications();
    }
  }, [staff]);

  const loadApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await apiService.getStaffApplications(staff.id, 10);
      setApplications(response.applications || []);
    } catch (err) {
      console.error('Error loading staff applications:', err);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'under_review':
        return 'text-yellow-600 bg-yellow-50';
      case 'submitted':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Staff Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {staff.avatar ? (
                  <img
                    src={staff.avatar}
                    alt={`${staff.firstName} ${staff.lastName}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {staff.firstName} {staff.lastName}
                </h3>
                <p className="text-sm text-gray-500">{staff.id}</p>
                <p className="text-sm text-gray-600">{staff.position}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${staff.statusColor}`}>
              {staff.status}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{staff.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{staff.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Working Hours</p>
                    <p className="text-sm text-gray-600">{staff.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employment Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-sm text-gray-600">{staff.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hire Date</p>
                    <p className="text-sm text-gray-600">{staff.hireDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Salary</p>
                    <p className="text-sm text-gray-600">{staff.salary}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Workload</p>
                    <p className={`text-sm font-medium ${
                      staff.currentWorkload === 'High' ? 'text-red-600' :
                      staff.currentWorkload === 'Medium' ? 'text-yellow-600' :
                      staff.currentWorkload === 'Low' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {staff.currentWorkload}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Performance Metrics</h4>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Applications:</span>
                    <span className="font-medium text-gray-900">{staff.totalApplications}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Revenue Generated:</span>
                    <span className="font-medium text-gray-900">GHS 6,750</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg. Processing Time:</span>
                    <span className="font-medium text-gray-900">12.5 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Applications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Assigned Applications</h4>
            
            {loadingApplications ? (
              <div className="text-center py-4 text-gray-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No applications assigned</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {app.first_name} {app.last_name}
                        </p>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(app.status)}`}>
                            {app.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          {app.priority && (
                            <span className={`text-xs font-medium ${getPriorityColor(app.priority)}`}>
                              {app.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{app.service_name || 'N/A'}</span>
                        <span>•</span>
                        <span>{app.email || 'N/A'}</span>
                        {app.created_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewStaffModal;




