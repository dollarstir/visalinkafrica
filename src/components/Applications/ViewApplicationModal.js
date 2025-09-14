import React from 'react';
import { X, FileText, User, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react';

const ViewApplicationModal = ({ application, onClose }) => {
  if (!application) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
                  <p className="text-sm text-gray-500">ID: {application.id}</p>
                </div>
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
              {/* Status and Priority */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(application.priority)}`}>
                    {application.priority?.charAt(0).toUpperCase() + application.priority?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Name</label>
                    <p className="text-sm text-gray-900">{application.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{application.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm text-gray-900">{application.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer ID</label>
                    <p className="text-sm text-gray-900">{application.customerId}</p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Service Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Category</label>
                    <p className="text-sm text-gray-900">{application.serviceCategory}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service</label>
                    <p className="text-sm text-gray-900">{application.serviceName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pricing Tier</label>
                    <p className="text-sm text-gray-900">{application.pricingTier || 'Standard'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Price</label>
                    <p className="text-sm text-gray-900">${application.price || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">{application.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-900">{application.updatedAt}</span>
                  </div>
                  {application.submittedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Submitted</span>
                      <span className="text-sm text-gray-900">{application.submittedAt}</span>
                    </div>
                  )}
                  {application.completedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Completed</span>
                      <span className="text-sm text-gray-900">{application.completedAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {application.notes && (
                <div className="card">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.notes}</p>
                </div>
              )}

              {/* Documents */}
              {application.documents && application.documents.length > 0 && (
                <div className="card">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Attached Documents</h4>
                  <div className="space-y-2">
                    {application.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{doc.name}</span>
                        <span className="text-xs text-gray-500">{doc.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal;

