import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  UserPlus
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    {
      name: 'Total Applications',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Customers',
      value: '856',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Pending Visits',
      value: '23',
      change: '-3%',
      changeType: 'negative',
      icon: Calendar,
      color: 'bg-yellow-500'
    },
    {
      name: 'Staff Members',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: UserPlus,
      color: 'bg-purple-500'
    }
  ];

  const recentApplications = [
    {
      id: 'APP-001',
      customer: 'John Doe',
      service: 'Passport Application',
      status: 'Pending',
      date: '2024-01-15',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'APP-002',
      customer: 'Jane Smith',
      service: 'Birth Certificate',
      status: 'Submitted',
      date: '2024-01-14',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'APP-003',
      customer: 'Mike Johnson',
      service: 'School Application',
      status: 'Draft',
      date: '2024-01-13',
      statusColor: 'bg-gray-100 text-gray-800'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      customer: 'Sarah Wilson',
      service: 'Visa Consultation',
      time: '10:00 AM',
      date: 'Today'
    },
    {
      id: 2,
      customer: 'David Brown',
      service: 'Document Review',
      time: '2:00 PM',
      date: 'Today'
    },
    {
      id: 3,
      customer: 'Lisa Davis',
      service: 'Application Submission',
      time: '9:00 AM',
      date: 'Tomorrow'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to VisaLink Africa Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <button 
              onClick={() => navigate('/applications')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{app.id}</p>
                  <p className="text-sm text-gray-600">{app.customer} - {app.service}</p>
                  <p className="text-xs text-gray-500">{app.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
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
            {upcomingAppointments.map((appointment) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/applications')}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>New Application</span>
          </button>
          <button 
            onClick={() => navigate('/customers')}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span>Add Customer</span>
          </button>
          <button 
            onClick={() => navigate('/appointments')}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <Clock className="h-5 w-5" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
