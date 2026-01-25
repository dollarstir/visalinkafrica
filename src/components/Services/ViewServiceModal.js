import React, { useState, useEffect } from 'react';
import { X, Settings, FolderOpen, Coins, Clock, CheckCircle, AlertCircle, FileText, TrendingUp } from 'lucide-react';
import apiService from '../../services/api';
import { formatPrice } from '../../utils/currency';

const ViewServiceModal = ({ service, onClose }) => {
  const [recentApplications, setRecentApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [serviceData, setServiceData] = useState(null);

  useEffect(() => {
    if (service && service.serviceId) {
      loadServiceDetails();
      loadRecentApplications();
    } else if (service) {
      setServiceData(service);
    }
  }, [service]);

  const loadServiceDetails = async () => {
    try {
      // Fetch fresh service data from API to ensure we have all fields
      const response = await apiService.getService(service.serviceId);
      if (response.service) {
        // Parse pricing_tiers properly
        let pricingTiers = [];
        if (response.service.pricing_tiers) {
          if (Array.isArray(response.service.pricing_tiers)) {
            pricingTiers = response.service.pricing_tiers;
          } else if (typeof response.service.pricing_tiers === 'string') {
            try {
              pricingTiers = JSON.parse(response.service.pricing_tiers);
            } catch (e) {
              console.error('Error parsing pricing_tiers:', e);
            }
          }
        }

        // Parse requirements
        let requirements = Array.isArray(response.service.requirements) 
          ? response.service.requirements 
          : [];

        setServiceData({
          ...service,
          name: response.service.name,
          description: response.service.description || '',
          category: response.service.category_name || service.category || 'Uncategorized',
          pricingTiers: pricingTiers,
          requirements: requirements,
          totalApplications: parseInt(response.service.total_applications) || 0,
          successRate: response.service.success_rate ? `${response.service.success_rate}%` : '0%',
          isActive: response.service.is_active !== false
        });
      } else {
        setServiceData(service);
      }
    } catch (err) {
      console.error('Error loading service details:', err);
      // Fallback to the service object passed as prop
      setServiceData(service);
    }
  };

  const loadRecentApplications = async () => {
    try {
      setLoadingApplications(true);
      // Fetch recent applications for this service
      const response = await apiService.getApplications({ 
        page: 1, 
        limit: 5 
      });
      
      // Filter applications for this service
      const serviceApps = (response.applications || [])
        .filter(app => app.service_id === service.serviceId)
        .slice(0, 3)
        .map(app => ({
          id: app.id,
          customer: `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'N/A',
          status: app.status,
          date: app.created_at ? new Date(app.created_at).toLocaleDateString() : ''
        }));
      
      setRecentApplications(serviceApps);
    } catch (err) {
      console.error('Error loading recent applications:', err);
      setRecentApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Use serviceData if available, otherwise use service prop
  const displayService = serviceData || service;
  
  if (!displayService) return null;

  // Ensure pricingTiers is an array - handle various formats
  let pricingTiers = [];
  if (displayService.pricingTiers) {
    if (Array.isArray(displayService.pricingTiers)) {
      pricingTiers = displayService.pricingTiers;
    } else if (typeof displayService.pricingTiers === 'string') {
      try {
        pricingTiers = JSON.parse(displayService.pricingTiers);
        if (!Array.isArray(pricingTiers)) {
          pricingTiers = [];
        }
      } catch (e) {
        console.error('Error parsing pricingTiers in ViewServiceModal:', e);
        pricingTiers = [];
      }
    } else if (typeof displayService.pricingTiers === 'object') {
      pricingTiers = [displayService.pricingTiers];
    }
  }
  
  // Ensure requirements is an array
  const requirements = Array.isArray(displayService.requirements) ? displayService.requirements : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Service Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{displayService.name}</h3>
                <p className="text-sm text-gray-500">{displayService.id}</p>
                <p className="text-sm text-gray-600">{displayService.category}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${displayService.statusColor || (displayService.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}`}>
              {displayService.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Description</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{displayService.description || 'No description available'}</p>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Service Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <FolderOpen className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Category</p>
                    <p className="text-sm text-gray-600">{displayService.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Success Rate</p>
                    <p className="text-sm text-gray-600">{displayService.successRate || '0%'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Applications</p>
                    <p className="text-sm text-gray-600">{displayService.totalApplications || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {displayService.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className={`text-sm ${displayService.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {displayService.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Pricing Options</h4>
            
            {pricingTiers.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                No pricing tiers configured
              </div>
            ) : (
              <div className="space-y-3">
                {pricingTiers.map((tier, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  tier.isDefault ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${tier.isDefault ? 'text-primary-700' : 'text-gray-700'}`}>
                        {tier.name}
                      </span>
                      {tier.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(tier.price)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Processing time: {tier.duration}
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Requirements</h4>
            
            {requirements.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                No requirements specified
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Service Statistics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Service Statistics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{displayService.totalApplications || 0}</div>
                <div className="text-sm text-blue-600">Total Applications</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{displayService.successRate || '0%'}</div>
                <div className="text-sm text-green-600">Success Rate</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {pricingTiers.length > 0 && pricingTiers[0].price ? formatPrice(pricingTiers[0].price) : 'N/A'}
                </div>
                <div className="text-sm text-purple-600">Starting Price</div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Recent Applications</h4>
            
            {loadingApplications ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                Loading applications...
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                No recent applications for this service
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Application from {app.customer}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          app.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                        </span>
                        <span className="text-xs text-gray-500">{app.date}</span>
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

export default ViewServiceModal;




