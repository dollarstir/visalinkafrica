import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Search, Send, FileText, X } from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { formatPrice } from '../../utils/currency';

const getTiersFromService = (service) => {
  if (!service || !service.pricing_tiers) return [];
  try {
    const raw = service.pricing_tiers;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return JSON.parse(raw) || [];
    return [];
  } catch (e) {
    return [];
  }
};

const CustomerServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Categories' }]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [tierModalService, setTierModalService] = useState(null);
  const [selectedTierName, setSelectedTierName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadServices();
  }, [categoryFilter, searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getServiceCategories({ page: 1, limit: 100 });
      setCategories([
        { id: 'all', name: 'All Categories' },
        ...(response.categories || []).map(cat => ({ id: String(cat.id), name: cat.name }))
      ]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 100 };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const response = await apiService.getServices(params);
      const list = (response.services || []).filter(s => s.is_active !== false);
      setServices(list);
    } catch (err) {
      showError(err.message || 'Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const openTierModal = (service) => {
    setTierModalService(service);
    const tiers = getTiersFromService(service);
    const defaultTier = tiers.find(t => t.isDefault) || tiers[0];
    setSelectedTierName(defaultTier ? (defaultTier.name || '') : '');
  };

  const closeTierModal = () => {
    setTierModalService(null);
    setSelectedTierName('');
  };

  const handleApplyWithTier = async () => {
    if (!tierModalService) return;
    const tiers = getTiersFromService(tierModalService);
    if (tiers.length > 0 && !selectedTierName) {
      showError('Please select a tier.');
      return;
    }
    try {
      setApplyingId(tierModalService.id);
      await apiService.createApplication({
        service_id: tierModalService.id,
        selected_tier_name: selectedTierName || null
      });
      showSuccess('Application submitted. You can track it under My Applications.');
      closeTierModal();
      loadServices();
    } catch (err) {
      showError(err.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  const getPricingDisplay = (service) => {
    let tiers = [];
    if (service.pricing_tiers) {
      try {
        tiers = typeof service.pricing_tiers === 'string' ? JSON.parse(service.pricing_tiers) : (Array.isArray(service.pricing_tiers) ? service.pricing_tiers : []);
      } catch (e) {
        tiers = [];
      }
    }
    if (!tiers.length) return '—';
    const first = tiers[0];
    if (first?.price) return formatPrice(first.price);
    if (first?.from) return `From ${formatPrice(first.from)}`;
    return '—';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse services and apply. Your applications will appear under My Applications.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card py-12 text-center text-gray-500 dark:text-gray-400">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="card py-12 text-center text-gray-500 dark:text-gray-400">No services found.</div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="card dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 shrink-0">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h2>
                    {service.category_name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.category_name}</p>
                    )}
                  </div>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{service.description}</p>
                )}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">Price: {getPricingDisplay(service)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  to="/app/applications"
                  className="btn-outline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  My Applications
                </Link>
                <button
                  type="button"
                  onClick={() => openTierModal(service)}
                  disabled={applyingId !== null}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier selection modal */}
      {tierModalService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeTierModal} aria-hidden />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select tier</h3>
                <button type="button" onClick={closeTierModal} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {tierModalService.name}
              </p>
              {(() => {
                const tiers = getTiersFromService(tierModalService);
                if (tiers.length === 0) {
                  return (
                    <p className="text-sm text-amber-600 dark:text-amber-400 py-4">
                      No pricing tiers configured for this service. Please contact support.
                    </p>
                  );
                }
                return (
                  <>
                    <div className="space-y-2 mb-6">
                      {tiers.map((tier) => {
                        const name = tier.name || '';
                        const price = tier.price != null ? formatPrice(tier.price) : '—';
                        const duration = tier.duration || '';
                        const isSelected = selectedTierName === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setSelectedTierName(name)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                              <span className="font-semibold text-primary-600 dark:text-primary-400">{price}</span>
                            </div>
                            {duration && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Processing: {duration}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={closeTierModal} className="btn-outline flex-1">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyWithTier}
                        disabled={applyingId !== null}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {applyingId === tierModalService.id ? 'Submitting...' : 'Submit application'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerServices;
