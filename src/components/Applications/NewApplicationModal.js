import React, { useState, useEffect } from 'react';
import { X, User, FileText, Calendar, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import { showError } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';

const NewApplicationModal = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    staff_id: '',
    priority: 'normal',
    status: 'draft',
    notes: '',
    estimated_completion_date: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [customersRes, servicesRes, staffRes] = await Promise.all([
          apiService.getCustomers({ page: 1, limit: 100 }),
          apiService.getServices({ page: 1, limit: 100 }),
          apiService.getStaff({ page: 1, limit: 100 })
        ]);

        setCustomers(customersRes.customers || []);
        setServices(servicesRes.services || []);
        setStaff(staffRes.staff || []);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        showError('Failed to load data. Please try again.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.service_id) newErrors.service_id = 'Service is required';
    if (!formData.staff_id) newErrors.staff_id = 'Staff member is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for API
      const applicationData = {
        customer_id: parseInt(formData.customer_id),
        service_id: parseInt(formData.service_id),
        staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
        // Agents cannot control status or estimated completion date
        status: user?.role === 'agent' ? 'draft' : formData.status,
        priority: formData.priority.toLowerCase(),
        notes: formData.notes || null,
        estimated_completion_date: user?.role === 'agent'
          ? null
          : (formData.estimated_completion_date || null)
      };

      await onSave(applicationData);
      onClose();
    } catch (err) {
      console.error('Error creating application:', err);
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === parseInt(formData.customer_id));
  const selectedService = services.find(s => s.id === parseInt(formData.service_id));
  const selectedStaff = staff.find(s => s.id === parseInt(formData.staff_id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Application</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {loadingData ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading data...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Customer Selection */}
                  <div>
                    <label className="label">Customer *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.customer_id ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name} ({customer.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.customer_id && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.customer_id}
                      </p>
                    )}
                  </div>

                  {/* Service Selection */}
                  <div>
                    <label className="label">Service *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.service_id ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select a service</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.service_id && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.service_id}
                      </p>
                    )}
                    {selectedService && (
                      <p className="mt-1 text-sm text-gray-500">{selectedService.description}</p>
                    )}
                  </div>

                  {/* Staff Assignment */}
                  <div>
                    <label className="label">Assign To *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="staff_id"
                        value={formData.staff_id}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.staff_id ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select staff member</option>
                        {staff.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.first_name} {member.last_name} - {member.position}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.staff_id && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.staff_id}
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="label">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="label">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field"
                      disabled={user?.role === 'agent'}
                    >
                      <option value="draft">Draft</option>
                      {user?.role !== 'agent' && (
                        <>
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                        </>
                      )}
                    </select>
                    {user?.role === 'agent' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Status is fixed to Draft. Admin or staff will update it as the application progresses.
                      </p>
                    )}
                  </div>

                  {/* Estimated Completion Date (staff/admin only) */}
                  {user?.role !== 'agent' && (
                    <div>
                      <label className="label">Estimated Completion Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="estimated_completion_date"
                          value={formData.estimated_completion_date}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field"
                      placeholder="Additional notes or requirements..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || loadingData}
                className="btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Application'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewApplicationModal;
