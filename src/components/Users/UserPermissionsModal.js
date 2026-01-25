import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Check, X as XIcon } from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const UserPermissionsModal = ({ user, onClose, onSave }) => {
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [user]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // Load all permissions
      const allPermsResponse = await apiService.getPermissions();
      const allPerms = allPermsResponse.permissions || [];
      
      // Load user's current permissions
      const userPermsResponse = await apiService.getUserPermissions(user.id);
      const userPerms = {};
      
      (userPermsResponse.permissions || []).forEach(p => {
        userPerms[p.code] = p.granted;
      });
      
      // Group permissions by category
      const grouped = {};
      allPerms.forEach(perm => {
        if (!grouped[perm.category]) {
          grouped[perm.category] = [];
        }
        grouped[perm.category].push({
          ...perm,
          granted: userPerms[perm.code] !== false // Default to true if not explicitly set
        });
      });
      
      setPermissions(grouped);
      setUserPermissions(userPerms);
    } catch (err) {
      console.error('Error loading permissions:', err);
      showError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId, code) => {
    setUserPermissions(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert userPermissions to array format
      const permissionsArray = [];
      Object.values(permissions).forEach(categoryPerms => {
        categoryPerms.forEach(perm => {
          const granted = userPermissions[perm.code] !== false;
          permissionsArray.push({
            permission_id: perm.id,
            granted: granted
          });
        });
      });
      
      await apiService.setUserPermissions(user.id, permissionsArray);
      showSuccess('User permissions updated successfully');
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err) {
      console.error('Error saving permissions:', err);
      showError(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (category) => {
    const categoryPerms = permissions[category] || [];
    const newPerms = { ...userPermissions };
    
    categoryPerms.forEach(perm => {
      newPerms[perm.code] = true;
    });
    
    setUserPermissions(newPerms);
  };

  const handleDeselectAll = (category) => {
    const categoryPerms = permissions[category] || [];
    const newPerms = { ...userPermissions };
    
    categoryPerms.forEach(perm => {
      newPerms[perm.code] = false;
    });
    
    setUserPermissions(newPerms);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" onClick={onClose}>
            <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
          </div>
          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Permissions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.name} ({user.email})
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {Object.keys(permissions).map(category => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white capitalize">
                      {category}
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSelectAll(category)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <button
                        onClick={() => handleDeselectAll(category)}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {permissions[category].map(perm => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {perm.name}
                            </span>
                          </div>
                          {perm.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {perm.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => togglePermission(perm.id, perm.code)}
                          className={`ml-4 flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                            userPermissions[perm.code] !== false
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {userPermissions[perm.code] !== false ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <XIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
              </button>
              <button
                onClick={onClose}
                disabled={saving}
                className="btn-secondary disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsModal;

