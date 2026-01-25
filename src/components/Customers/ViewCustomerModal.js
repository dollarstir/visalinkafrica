import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, FileText, Clock } from 'lucide-react';

const ViewCustomerModal = ({ customer, onClose }) => {
  if (!customer) return null;

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'other': return 'Other';
      case 'prefer_not_to_say': return 'Prefer not to say';
      default: return 'Not specified';
    }
  };

  const getCountryLabel = (countryCode) => {
    const countries = {
      'US': 'United States',
      'CA': 'Canada',
      'UK': 'United Kingdom',
      'AU': 'Australia',
      'NG': 'Nigeria',
      'GH': 'Ghana',
      'KE': 'Kenya',
      'ZA': 'South Africa'
    };
    return countries[countryCode] || countryCode;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
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
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
                  <p className="text-sm text-gray-500">ID: {customer.id}</p>
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
              {/* Personal Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm text-gray-900">{customer.firstName} {customer.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm text-gray-900">{customer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-sm text-gray-900">{formatDate(customer.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-sm text-gray-900">{getGenderLabel(customer.gender)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Occupation</label>
                    <p className="text-sm text-gray-900">{customer.occupation || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm text-gray-900">{customer.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">City</label>
                    <p className="text-sm text-gray-900">{customer.city || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">State/Province</label>
                    <p className="text-sm text-gray-900">{customer.state || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ZIP/Postal Code</label>
                    <p className="text-sm text-gray-900">{customer.zipCode || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    <p className="text-sm text-gray-900">{getCountryLabel(customer.country)}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {(customer.emergencyContact || customer.emergencyPhone) && (
                <div className="card">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Name</label>
                      <p className="text-sm text-gray-900">{customer.emergencyContact || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Phone</label>
                      <p className="text-sm text-gray-900">{customer.emergencyPhone || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Since</label>
                    <p className="text-sm text-gray-900">{formatDate(customer.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-sm text-gray-900">{formatDate(customer.updatedAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Applications</label>
                    <p className="text-sm text-gray-900">{customer.totalApplications || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' :
                      customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="card">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}

              {/* Recent Applications */}
              {customer.recentApplications && customer.recentApplications.length > 0 && (
                <div className="card">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Applications
                  </h4>
                  <div className="space-y-2">
                    {customer.recentApplications.map((app, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{app.id}</span>
                          <span className="text-sm text-gray-600 ml-2">{app.service}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          app.status === 'completed' ? 'bg-green-100 text-green-800' :
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
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

export default ViewCustomerModal;






