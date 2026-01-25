import React from 'react';
import { X, User, Mail, Phone, Calendar, Clock, MapPin, FileText, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

const ViewVisitModal = ({ visit, onClose }) => {
  if (!visit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Visit Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visit Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{visit.id}</h3>
                <p className="text-sm text-gray-500">{visit.visitType}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${visit.statusColor}`}>
              {visit.status}
            </span>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Customer Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer Name</p>
                    <p className="text-sm text-gray-600">{visit.customerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{visit.customerEmail}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Visit Date</p>
                    <p className="text-sm text-gray-600">{visit.visitDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Visit Time</p>
                    <p className="text-sm text-gray-600">{visit.visitTime} ({visit.duration})</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Visit Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Purpose</p>
                    <p className="text-sm text-gray-600">{visit.purpose}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{visit.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Staff Member</p>
                    <p className="text-sm text-gray-600">{visit.staffMember}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {visit.followUpRequired ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-3" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Follow-up Required</p>
                    <p className={`text-sm ${visit.followUpRequired ? 'text-yellow-600' : 'text-green-600'}`}>
                      {visit.followUpRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome */}
          {visit.outcome && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Visit Outcome</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{visit.outcome}</p>
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Customer History</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total visits:</span>
                  <span className="font-medium text-gray-900">3 visits</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last visit:</span>
                  <span className="font-medium text-gray-900">2024-01-10</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Applications submitted:</span>
                  <span className="font-medium text-gray-900">2 applications</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success rate:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>
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

export default ViewVisitModal;




