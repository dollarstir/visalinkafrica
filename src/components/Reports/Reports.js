import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Filter, 
  Calendar,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  PieChart,
  Activity
} from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Mock data - replace with API calls
  const reportData = {
    overview: {
      totalApplications: 1247,
      totalCustomers: 856,
      totalRevenue: 187500,
      successRate: 94.2,
      avgProcessingTime: 12.5,
      monthlyGrowth: 8.3
    },
    applications: {
      byStatus: [
        { status: 'Completed', count: 456, percentage: 36.6 },
        { status: 'In Progress', count: 234, percentage: 18.8 },
        { status: 'Pending', count: 189, percentage: 15.2 },
        { status: 'Draft', count: 156, percentage: 12.5 },
        { status: 'Rejected', count: 98, percentage: 7.9 },
        { status: 'Cancelled', count: 114, percentage: 9.1 }
      ],
      byCategory: [
        { category: 'Document', count: 567, revenue: 85050 },
        { category: 'Travel', count: 234, revenue: 46800 },
        { category: 'Education', count: 189, revenue: 18900 },
        { category: 'Business', count: 98, revenue: 29400 },
        { category: 'Other', count: 159, revenue: 7350 }
      ],
      monthlyTrend: [
        { month: 'Jan', applications: 89, revenue: 13350 },
        { month: 'Feb', applications: 112, revenue: 16800 },
        { month: 'Mar', applications: 134, revenue: 20100 },
        { month: 'Apr', applications: 98, revenue: 14700 },
        { month: 'May', applications: 156, revenue: 23400 },
        { month: 'Jun', applications: 178, revenue: 26700 }
      ]
    },
    staff: {
      performance: [
        { name: 'Sarah Wilson', applications: 45, successRate: 96.7, revenue: 6750 },
        { name: 'Mike Johnson', applications: 38, successRate: 94.2, revenue: 5700 },
        { name: 'Lisa Davis', applications: 42, successRate: 92.9, revenue: 6300 },
        { name: 'David Brown', applications: 29, successRate: 89.7, revenue: 4350 }
      ],
      workload: [
        { name: 'Sarah Wilson', current: 8, completed: 45, pending: 3 },
        { name: 'Mike Johnson', current: 12, completed: 38, pending: 5 },
        { name: 'Lisa Davis', current: 6, completed: 42, pending: 2 },
        { name: 'David Brown', current: 4, completed: 29, pending: 1 }
      ]
    },
    revenue: {
      monthly: [
        { month: 'Jan', revenue: 13350, applications: 89, avgRevenue: 150 },
        { month: 'Feb', revenue: 16800, applications: 112, avgRevenue: 150 },
        { month: 'Mar', revenue: 20100, applications: 134, avgRevenue: 150 },
        { month: 'Apr', revenue: 14700, applications: 98, avgRevenue: 150 },
        { month: 'May', revenue: 23400, applications: 156, avgRevenue: 150 },
        { month: 'Jun', revenue: 26700, applications: 178, avgRevenue: 150 }
      ],
      byService: [
        { service: 'Passport Application', revenue: 45000, count: 300, avgPrice: 150 },
        { service: 'Birth Certificate', revenue: 36000, count: 240, avgPrice: 150 },
        { service: 'Visa Application', revenue: 54000, count: 180, avgPrice: 300 },
        { service: 'School Application', revenue: 22500, count: 150, avgPrice: 150 },
        { service: 'Business Registration', revenue: 30000, count: 100, avgPrice: 300 }
      ],
      paymentMethods: [
        { method: 'Bank Transfer', amount: 120000, percentage: 64 },
        { method: 'Credit Card', amount: 45000, percentage: 24 },
        { method: 'Cash', amount: 22500, percentage: 12 }
      ]
    },
    customers: {
      demographics: [
        { ageGroup: '18-25', count: 234, percentage: 27.3 },
        { ageGroup: '26-35', count: 312, percentage: 36.4 },
        { ageGroup: '36-45', count: 189, percentage: 22.1 },
        { ageGroup: '46-55', count: 89, percentage: 10.4 },
        { ageGroup: '55+', count: 32, percentage: 3.7 }
      ],
      acquisition: [
        { source: 'Referral', count: 345, percentage: 40.3 },
        { source: 'Website', count: 234, percentage: 27.3 },
        { source: 'Social Media', count: 156, percentage: 18.2 },
        { source: 'Advertisement', count: 89, percentage: 10.4 },
        { source: 'Walk-in', count: 32, percentage: 3.7 }
      ],
      retention: {
        newCustomers: 156,
        returningCustomers: 700,
        retentionRate: 81.8,
        avgCustomerValue: 219
      }
    }
  };

  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'applications', label: 'Applications', icon: FileText },
    { value: 'staff', label: 'Staff Performance', icon: Users },
    { value: 'revenue', label: 'Revenue', icon: DollarSign },
    { value: 'customers', label: 'Customers', icon: Users }
  ];

  const exportReport = () => {
    // Mock export functionality
    console.log('Exporting report...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
          <button onClick={exportReport} className="btn-primary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedReport(type.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  selectedReport === type.value
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-48"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalApplications.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{reportData.overview.monthlyGrowth}% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalCustomers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${reportData.overview.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.overview.successRate}%</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +2.1% from last month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Status</h3>
              <div className="space-y-3">
                {reportData.applications.byStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        item.status === 'Completed' ? 'bg-green-500' :
                        item.status === 'In Progress' ? 'bg-blue-500' :
                        item.status === 'Pending' ? 'bg-yellow-500' :
                        item.status === 'Draft' ? 'bg-gray-500' :
                        item.status === 'Rejected' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Applications Trend</h3>
              <div className="space-y-3">
                {reportData.applications.monthlyTrend.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{item.applications} apps</span>
                      <span className="text-sm font-bold text-gray-900">${item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Report */}
      {selectedReport === 'applications' && (
        <div className="space-y-6">
          {/* Applications by Category */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Category</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Processing Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.applications.byCategory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.floor(Math.random() * 20) + 5} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Staff Performance Report */}
      {selectedReport === 'staff' && (
        <div className="space-y-6">
          {/* Staff Performance Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Workload
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.staff.performance.map((staff, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {staff.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {staff.applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          staff.successRate >= 95 ? 'bg-green-100 text-green-800' :
                          staff.successRate >= 90 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {staff.successRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${staff.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reportData.staff.workload[index].current <= 5 ? 'bg-green-100 text-green-800' :
                          reportData.staff.workload[index].current <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reportData.staff.workload[index].current} active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${reportData.overview.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Revenue per Application</p>
                  <p className="text-2xl font-bold text-gray-900">$150</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +5% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Customer Value</p>
                  <p className="text-2xl font-bold text-gray-900">${reportData.customers.retention.avgCustomerValue}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8% from last month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Service */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.revenue.byService.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.avgPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${(item.revenue / reportData.overview.totalRevenue) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {((item.revenue / reportData.overview.totalRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              <div className="space-y-3">
                {reportData.revenue.monthly.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{item.applications} apps</span>
                      <span className="text-sm font-bold text-gray-900">${item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {reportData.revenue.paymentMethods.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.method}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">${item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Report */}
      {selectedReport === 'customers' && (
        <div className="space-y-6">
          {/* Customer Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalCustomers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.customers.retention.newCustomers}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.customers.retention.retentionRate}%</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +3% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Customer Value</p>
                  <p className="text-2xl font-bold text-gray-900">${reportData.customers.retention.avgCustomerValue}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +5% from last month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Demographics</h3>
              <div className="space-y-3">
                {reportData.customers.demographics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.ageGroup} years</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition Sources</h3>
              <div className="space-y-3">
                {reportData.customers.acquisition.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.source}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-outline flex items-center justify-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export to PDF</span>
          </button>
          <button className="btn-outline flex items-center justify-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export to Excel</span>
          </button>
          <button className="btn-outline flex items-center justify-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
