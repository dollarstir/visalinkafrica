import React from 'react';
import { X, User, Mail, Phone, Calendar, Clock, Clipboard, Users } from 'lucide-react';

const ViewVisitorModal = ({ visitor, onClose }) => {
  if (!visitor) return null;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'no show': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Visitor Details</h3>
                  <p className="text-sm text-gray-500">ID: {visitor.id}</p>
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
              {/* Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visitor.status)}`}>
                    {visitor.status}
                  </span>
                </div>
              </div>

              {/* Visitor Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Visitor Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">First Name</label>
                    <p className="text-sm text-gray-900">{visitor.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Name</label>
                    <p className="text-sm text-gray-900">{visitor.lastName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{visitor.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm text-gray-900">{visitor.phone}</p>
                  </div>
                </div>
              </div>

              {/* Visit Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Visit Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Visit Date</label>
                    <p className="text-sm text-gray-900">{visitor.visitDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Visit Time</label>
                    <p className="text-sm text-gray-900">{visitor.visitTime}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Purpose</label>
                    <p className="text-sm text-gray-900">{visitor.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Staff Assignment */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Staff Assignment
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Staff Member</label>
                    <p className="text-sm text-gray-900">{visitor.staffMember}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {visitor.notes && (
                <div className="card">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Clipboard className="h-5 w-5 mr-2" />
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{visitor.notes}</p>
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

export default ViewVisitorModal;
