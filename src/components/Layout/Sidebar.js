import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  UserPlus,
  FolderOpen,
  Settings,
  BarChart3,
  User,
  X,
  Shield,
  Globe,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { hasPermission } from '../../utils/permissions';
import apiService from '../../services/api';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [pendingAgentCount, setPendingAgentCount] = useState(0);

  // Fetch pending agent applications count (for badge); refetch when notifications or route change
  useEffect(() => {
    if (!user || !hasPermission(user, 'agent_applications.view')) return;
    apiService.getAgentApplicationsCount('pending').then(setPendingAgentCount).catch(() => setPendingAgentCount(0));
  }, [user, unreadCount, location.pathname]);

  const customerNavigation = [
    { name: 'Dashboard', href: '/app', icon: Home, permission: null },
    { name: 'Services', href: '/app/services', icon: Settings, permission: null },
    { name: 'My Applications', href: '/app/applications', icon: FileText, permission: null },
    { name: 'Profile', href: '/app/profile', icon: User, permission: null },
  ];

  const navigation = (user?.role === 'customer' ? customerNavigation : [
    { name: 'Dashboard', href: '/app', icon: Home, permission: null },
    { name: 'Applications', href: '/app/applications', icon: FileText, permission: 'applications.view' },
    { name: 'Customers', href: '/app/customers', icon: Users, permission: 'customers.view' },
    { name: 'Visitors', href: '/app/visitors', icon: UserCheck, permission: 'visitors.view' },
    { name: 'Visits', href: '/app/visits', icon: Calendar, permission: 'visits.view' },
    { name: 'Appointments', href: '/app/appointments', icon: Clock, permission: 'appointments.view' },
    { name: 'Staff', href: '/app/staff', icon: UserPlus, permission: 'staff.view' },
    { name: 'Service Categories', href: '/app/service-categories', icon: FolderOpen, permission: 'service_categories.view' },
    { name: 'Services', href: '/app/services', icon: Settings, permission: 'services.view' },
    { name: 'Reports', href: '/app/reports', icon: BarChart3, permission: 'reports.view' },
    { name: 'Documents', href: '/app/documents', icon: FileText, permission: 'documents.view' },
    { name: 'Users', href: '/app/users', icon: Shield, permission: 'users.view' },
    { name: 'Agents', href: '/app/agents', icon: UserPlus, permission: 'agents.view' },
    { name: 'Agents Request', href: '/app/agent-applications', icon: UserCheck, permission: 'agent_applications.view', badgeKey: 'agent-applications' },
    { name: 'Website', href: '/app/website', icon: Globe, permission: 'website.view' },
    { name: 'Job Applications', href: '/app/job-applications', icon: Briefcase, permission: 'job_applications.view' },
    { name: 'Settings', href: '/app/settings', icon: Settings, permission: 'settings.view' },
    { name: 'Profile', href: '/app/profile', icon: User, permission: null },
  ]).filter(item => {
    // Show item if no permission required, or user has the permission, or user is admin
    if (!item.permission) return true;
    if (user?.role === 'admin') return true;

    // Agents: always allow core menus they need, even if no explicit permission is set
    if (user?.role === 'agent') {
      const agentAllowedMenus = ['Applications', 'Customers', 'Services'];
      if (agentAllowedMenus.includes(item.name)) {
        return true;
      }
    }

    return hasPermission(user, item.permission);
  });

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 dark:bg-gray-900 opacity-75 dark:opacity-80"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">VisaLink Africa</h1>
          <button
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}
                  `} />
                  <span className="flex-1">{item.name}</span>
                  {item.badgeKey === 'agent-applications' && pendingAgentCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold rounded-full bg-primary-600 text-white dark:bg-primary-500">
                      {pendingAgentCount > 99 ? '99+' : pendingAgentCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
