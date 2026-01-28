import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Shield,
  Mail,
  Phone,
  Building,
  Calendar,
  Filter
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import NewUserModal from './NewUserModal';
import EditUserModal from './EditUserModal';
import ViewUserModal from './ViewUserModal';
import UserPermissionsModal from './UserPermissionsModal';
import { hasPermission } from '../../utils/permissions';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    staff: 0,
    users: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [roleFilter, statusFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        limit: 100
      };
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (roleFilter && roleFilter !== 'all') {
        params.role = roleFilter;
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.is_active = statusFilter === 'active' ? 'true' : 'false';
      }
      
      const response = await apiService.getUsers(params);
      
      const transformedUsers = (response.users || []).map(u => ({
        id: u.id,
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'user',
        department: u.department || '',
        phone: u.phone || '',
        address: u.address || '',
        avatar: u.avatar || null,
        isActive: u.is_active !== false,
        createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
        updatedAt: u.updated_at ? new Date(u.updated_at).toLocaleDateString() : ''
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getUserStats();
      if (response.stats) {
        setStats({
          total: parseInt(response.stats.total) || 0,
          admins: parseInt(response.stats.admins) || 0,
          staff: parseInt(response.stats.staff) || 0,
          users: parseInt(response.stats.users) || 0,
          active: parseInt(response.stats.active) || 0,
          inactive: parseInt(response.stats.inactive) || 0
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowNewUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleDeleteUser = async (user) => {
    const confirmed = await showDeleteConfirm(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await apiService.deleteUser(user.id);
      showSuccess('User deleted successfully');
      await loadUsers();
      await loadStats();
    } catch (err) {
      console.error('Error deleting user:', err);
      showError(err.message || 'Failed to delete user');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        await apiService.updateUser(selectedUser.id, userData);
        showSuccess('User updated successfully');
      } else {
        await apiService.createUser(userData);
        showSuccess('User created successfully');
      }
      setShowNewUserModal(false);
      setShowEditUserModal(false);
      setSelectedUser(null);
      await loadUsers();
      await loadStats();
    } catch (err) {
      console.error('Error saving user:', err);
      showError(err.message || 'Failed to save user');
      throw err;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'staff':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and their roles</p>
        </div>
        {hasPermission(currentUser, 'users.create') && (
          <button onClick={handleAddUser} className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Staff</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.staff}</p>
            </div>
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users}</p>
            </div>
            <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <User className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
            </div>
            <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="card dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {hasPermission(currentUser, 'users.view') && (
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            title="View User"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission(currentUser, 'users.edit') && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Edit User"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission(currentUser, 'users.manage_permissions') && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPermissionsModal(true);
                            }}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                            title="Manage Permissions"
                          >
                            <Shield className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission(currentUser, 'users.delete') && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showNewUserModal && (
        <NewUserModal
          onClose={() => {
            setShowNewUserModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {showViewUserModal && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => {
            setShowViewUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showPermissionsModal && selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default Users;

