import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  UserPlus,
  Settings,
  ArrowRight
} from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [customerAppCount, setCustomerAppCount] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (user?.role === 'customer') {
      apiService.getApplications({ page: 1, limit: 1 })
        .then((r) => setCustomerAppCount(r.pagination?.total ?? 0))
        .catch(() => setCustomerAppCount(0));
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [user?.role]);

  // Load current staff ID for logged-in staff user
  useEffect(() => {
    const loadCurrentStaff = async () => {
      try {
        if (!user || user.role !== 'staff' || !user.email) return;
        const params = {
          page: 1,
          limit: 100,
          search: user.email,
          status: 'all'
        };
        const response = await apiService.getStaff(params);
        const staffList = response.staff || [];
        const matched = staffList.find(
          (m) => m.email && m.email.toLowerCase() === user.email.toLowerCase()
        );
        if (matched) {
          setCurrentStaffId(matched.id);
        }
      } catch (err) {
        console.error('Error loading current staff info:', err);
      }
    };

    loadCurrentStaff();
  }, [user]);

  const loadRecentApplications = useCallback(async () => {
    try {
      if (!user) return;
      
      if (!hasPermission(user, 'applications.view') && user?.role !== 'admin' && user?.role !== 'agent') {
        setRecentApplications([]);
        return;
      }

      const applicationsResponse = await apiService.getApplications({ page: 1, limit: 100 });
      let applications = applicationsResponse.applications || [];
      
      // For staff users, filter to show only their assigned applications in "My Recent Applications"
      // Note: Agents are already filtered by backend to show only their applications
      if (user?.role === 'staff' && currentStaffId) {
        applications = applications.filter(app => app.staff_id === currentStaffId);
      }
      
      // Take only the first 5 for display
      const transformedApplications = applications.slice(0, 5).map(app => ({
        id: `APP-${String(app.id).padStart(3, '0')}`,
        customer: `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'N/A',
        service: app.service_name || 'N/A',
        status: app.status || 'draft',
        date: app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
        statusColor: getStatusColor(app.status)
      }));
      setRecentApplications(transformedApplications);
    } catch (err) {
      console.error('Error loading recent applications:', err);
      setRecentApplications([]);
    }
  }, [user, currentStaffId]);

  // Reload recent applications when staff ID is loaded (for staff users)
  // For agents, applications are already filtered by backend, so no need to wait
  useEffect(() => {
    if (!user) return;
    
    if (user?.role === 'staff' && currentStaffId) {
      loadRecentApplications();
    } else if (user?.role === 'agent') {
      // Agents can load immediately - backend already filters
      loadRecentApplications();
    } else if (user?.role === 'admin' || hasPermission(user, 'applications.view')) {
      // Admins and users with permission can load immediately
      loadRecentApplications();
    }
  }, [currentStaffId, user, loadRecentApplications]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard stats
      const statsResponse = await apiService.getDashboardStats();
      const dashboardStats = statsResponse;

      // Transform stats for display based on permissions
      const statsData = [];
      
      // Show Applications stats if user has applications.view permission
      if (hasPermission(user, 'applications.view') || user?.role === 'admin' || user?.role === 'agent') {
        if (user?.role === 'staff') {
          // For staff: show both personal and global counts
          statsData.push({
            name: 'My Applications',
            value: dashboardStats.applications?.my_applications || 0,
            change: '',
            changeType: 'positive',
            icon: FileText,
            color: 'bg-blue-500'
          });
          statsData.push({
            name: 'Total Applications',
            value: dashboardStats.applications?.total_applications || 0,
            change: '',
            changeType: 'neutral',
            icon: FileText,
            color: 'bg-blue-400'
          });
        } else if (user?.role === 'agent') {
          // For agents: show only their applications count (backend already filters)
          statsData.push({
            name: 'My Applications',
            value: dashboardStats.applications?.total_applications || 0,
            change: '',
            changeType: 'positive',
            icon: FileText,
            color: 'bg-blue-500'
          });
        } else {
          // Admin and other roles: show global total
          statsData.push({
            name: 'Total Applications',
            value: dashboardStats.applications?.total_applications || 0,
            change: '',
            changeType: 'positive',
            icon: FileText,
            color: 'bg-blue-500'
          });
        }
      }
      
      // Show Active Customers if user has customers.view permission
      if (hasPermission(user, 'customers.view') || user?.role === 'admin') {
        statsData.push({
          name: 'Active Customers',
          value: dashboardStats.customers?.active_customers || dashboardStats.customers?.total_customers || 0,
          change: '',
          changeType: 'positive',
          icon: Users,
          color: 'bg-green-500'
        });
      }
      
      // Show Pending Visits if user has visits.view permission
      if (hasPermission(user, 'visits.view') || user?.role === 'admin') {
        statsData.push({
          name: 'Pending Visits',
          value: dashboardStats.pending_visits || dashboardStats.visitors?.scheduled || 0,
          change: '',
          changeType: 'neutral',
          icon: Calendar,
          color: 'bg-yellow-500'
        });
      }
      
      // Show Staff Members only if user has staff.view permission (admins can see this)
      if (hasPermission(user, 'staff.view') || user?.role === 'admin') {
        statsData.push({
          name: 'Staff Members',
          value: dashboardStats.staff?.total_staff || 0,
          change: '',
          changeType: 'positive',
          icon: UserPlus,
          color: 'bg-purple-500'
        });
      }
      
      setStats(statsData);

      // Load recent applications
      // For staff users, wait for staff ID to be loaded before loading applications
      // For agents, backend already filters, so load immediately
      if (user?.role === 'staff' && !currentStaffId) {
        // Staff ID not loaded yet, will load applications when staff ID is available
        setRecentApplications([]);
      } else {
        await loadRecentApplications();
      }

      // Load upcoming appointments only if user has appointments.view permission
      if (hasPermission(user, 'appointments.view') || user?.role === 'admin') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointmentsResponse = await apiService.getAppointments({ 
          page: 1, 
          limit: 100, // Get more to filter properly
          status: 'all',
          date: 'all'
        });
        
        // Filter and sort upcoming appointments
        const upcoming = (appointmentsResponse.appointments || [])
          .filter(apt => {
            if (!apt.appointment_date) return false;
            const aptDate = new Date(apt.appointment_date);
            aptDate.setHours(0, 0, 0, 0);
            const isUpcoming = aptDate >= today;
            const isValidStatus = apt.status === 'pending' || apt.status === 'confirmed';
            return isUpcoming && isValidStatus;
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.appointment_date}T${a.appointment_time || '00:00:00'}`);
            const dateB = new Date(`${b.appointment_date}T${b.appointment_time || '00:00:00'}`);
            return dateA - dateB;
          })
          .slice(0, 5)
          .map(apt => {
            const aptDate = new Date(apt.appointment_date);
            aptDate.setHours(0, 0, 0, 0);
            const isToday = aptDate.getTime() === today.getTime();
            const isTomorrow = aptDate.getTime() === tomorrow.getTime();
            
            // Format time if available
            let timeDisplay = 'N/A';
            if (apt.appointment_time) {
              try {
                const timeParts = apt.appointment_time.split(':');
                if (timeParts.length >= 2) {
                  const hours = parseInt(timeParts[0]);
                  const minutes = timeParts[1];
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  const displayHours = hours % 12 || 12;
                  timeDisplay = `${displayHours}:${minutes} ${ampm}`;
                }
              } catch (e) {
                timeDisplay = apt.appointment_time;
              }
            }
            
            return {
              id: apt.id,
              customer: apt.customer_name || 'N/A',
              service: apt.service || 'N/A',
              time: timeDisplay,
              date: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : aptDate.toLocaleDateString()
            };
          });
        setUpcomingAppointments(upcoming);
      } else {
        setUpcomingAppointments([]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Customer portal dashboard
  if (user?.role === 'customer') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your portal</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome, {user?.name || 'Customer'}. Manage your services and applications here.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/app/applications"
            className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-card transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Applications</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{customerAppCount ?? '—'} application(s)</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </Link>
          <Link
            to="/app/services"
            className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-card transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Services</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse and apply for services</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to VisaLink Africa Management System</p>
        </div>
        <div className="card text-center py-12">
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to VisaLink Africa Management System</p>
        </div>
        <div className="card text-center py-12">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          {user?.role === 'admin' 
            ? `Welcome, ${user?.name || 'Admin'}. Manage your VisaLink Africa system.`
            : user?.role === 'staff'
            ? `Welcome, ${user?.name || 'Staff Member'}. Here's your overview.`
            : `Welcome, ${user?.name || 'User'}. Welcome to VisaLink Africa Management System.`
          }
        </p>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.length === 1 ? 'lg:grid-cols-1' : stats.length === 2 ? 'lg:grid-cols-2' : stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  {stat.change && (
                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                      {stat.change} from last month
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-600">No statistics available based on your current permissions.</p>
        </div>
      )}

      {/* Main Content Grid */}
      {(hasPermission(user, 'applications.view') || hasPermission(user, 'appointments.view') || user?.role === 'admin' || user?.role === 'agent') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          {(hasPermission(user, 'applications.view') || user?.role === 'admin' || user?.role === 'agent') ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.role === 'staff' || user?.role === 'agent' ? 'My Recent Applications' : 'Recent Applications'}
                </h2>
                <button 
                  onClick={() => navigate('/applications')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentApplications.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No recent applications</p>
                ) : (
                  recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{app.id}</p>
                        <p className="text-sm text-gray-600">{app.customer} - {app.service}</p>
                        <p className="text-xs text-gray-500">{app.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor}`}>
                        {app.status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Upcoming Appointments */}
          {hasPermission(user, 'appointments.view') || user?.role === 'admin' ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <button 
                  onClick={() => navigate('/appointments')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.customer}</p>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                        <p className="text-xs text-gray-500">{appointment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Quick Actions */}
      {(hasPermission(user, 'applications.create') || hasPermission(user, 'customers.create') || hasPermission(user, 'appointments.create') || user?.role === 'admin') && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hasPermission(user, 'applications.create') || user?.role === 'admin' ? (
              <button 
                onClick={() => navigate('/applications')}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>New Application</span>
              </button>
            ) : null}
            {hasPermission(user, 'customers.create') || user?.role === 'admin' ? (
              <button 
                onClick={() => navigate('/customers')}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>Add Customer</span>
              </button>
            ) : null}
            {hasPermission(user, 'appointments.create') || user?.role === 'admin' ? (
              <button 
                onClick={() => navigate('/appointments')}
                className="btn-outline flex items-center justify-center space-x-2"
              >
                <Clock className="h-5 w-5" />
                <span>Schedule Appointment</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
