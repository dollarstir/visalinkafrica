import React, { useState, useEffect } from 'react';
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
import apiService from '../../services/api';
import { showError, showSuccess } from '../../utils/toast';
import { formatPrice } from '../../utils/currency';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const Reports = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [reportData, setReportData] = useState({
    overview: {
      totalApplications: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      successRate: 0,
      avgProcessingTime: 0,
      monthlyGrowth: 0
    },
    applications: {
      byStatus: [],
      byCategory: [],
      monthlyTrend: []
    },
    staff: {
      performance: [],
      workload: []
    },
    revenue: {
      monthly: [],
      byService: [],
      paymentMethods: []
    },
    customers: {
      demographics: [],
      acquisition: [],
      retention: {
        newCustomers: 0,
        returningCustomers: 0,
        retentionRate: 0,
        avgCustomerValue: 0
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, selectedPeriod]);

  // Check if user has permission to view reports
  if (!hasPermission(user, 'reports.view') && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedReport === 'overview') {
        const overviewData = await apiService.getOverviewStats(selectedPeriod);
        const dashboardData = await apiService.getDashboardStats();
        
        setReportData(prev => ({
          ...prev,
          overview: {
            totalApplications: overviewData.totalApplications || 0,
            totalCustomers: overviewData.totalCustomers || 0,
            totalRevenue: parseFloat(overviewData.totalRevenue) || 0,
            successRate: overviewData.successRate || 0,
            avgProcessingTime: overviewData.avgProcessingTime || 0,
            monthlyGrowth: 0 // Would need historical data to calculate
          }
        }));
      } else if (selectedReport === 'applications') {
        const appData = await apiService.getApplicationStats(selectedPeriod);
        console.log('Application stats data:', appData);
        
        // Transform byStatus data
        const byStatus = (appData.byStatus || []).map(item => {
          const total = appData.byStatus.reduce((sum, s) => sum + parseInt(s.count), 0);
          return {
            status: item.status?.replace('_', ' ') || item.status,
            count: parseInt(item.count) || 0,
            percentage: total > 0 ? ((parseInt(item.count) / total) * 100).toFixed(1) : 0
          };
        });

        // Transform byCategory data
        const byCategory = (appData.byCategory || []).map(item => ({
          category: item.category || 'Uncategorized',
          count: parseInt(item.count) || 0,
          revenue: parseFloat(item.revenue) || 0
        }));

        // Transform monthlyTrend data
        const monthlyTrend = (appData.monthlyTrend || []).map(item => ({
          month: item.month || '',
          applications: parseInt(item.applications) || 0,
          revenue: parseFloat(item.revenue) || 0
        }));

        setReportData(prev => ({
          ...prev,
          applications: {
            byStatus,
            byCategory,
            monthlyTrend
          }
        }));
      } else if (selectedReport === 'staff') {
        const staffData = await apiService.getStaffStats();
        
        // Transform performance data
        const performance = (staffData.performance || []).map(item => ({
          name: item.name || 'Unknown',
          applications: parseInt(item.applications) || 0,
          successRate: parseFloat(item.success_rate) || 0,
          revenue: parseFloat(item.revenue) || 0
        }));

        // Transform workload data
        const workload = (staffData.workload || []).map(item => ({
          name: item.name || 'Unknown',
          current: parseInt(item.current) || 0,
          completed: parseInt(item.completed) || 0,
          pending: parseInt(item.pending) || 0
        }));

        setReportData(prev => ({
          ...prev,
          staff: {
            performance,
            workload
          }
        }));
      } else if (selectedReport === 'revenue') {
        const revenueData = await apiService.getRevenueStats(selectedPeriod);
        
        // Transform monthly data
        const monthly = (revenueData.monthly || []).map(item => {
          const revenue = parseFloat(item.revenue) || 0;
          const applications = parseInt(item.applications) || 0;
          return {
            month: item.month || '',
            revenue: revenue,
            applications: applications,
            avgRevenue: applications > 0 ? revenue / applications : 0
          };
        });

        // Transform byService data
        const byService = (revenueData.byService || []).map(item => ({
          service: item.service || 'Unknown',
          revenue: parseFloat(item.revenue) || 0,
          count: parseInt(item.count) || 0,
          avgPrice: parseFloat(item.avgPrice) || 0
        }));

        setReportData(prev => ({
          ...prev,
          revenue: {
            monthly,
            byService,
            paymentMethods: [] // Would need payment data
          }
        }));
      } else if (selectedReport === 'customers') {
        const customerData = await apiService.getCustomerStats();
        
        // Transform demographics data
        const demographics = (customerData.demographics || []).map(item => {
          const total = customerData.demographics.reduce((sum, d) => sum + parseInt(d.count), 0);
          return {
            ageGroup: item.age_group || 'Unknown',
            count: parseInt(item.count) || 0,
            percentage: total > 0 ? ((parseInt(item.count) / total) * 100).toFixed(1) : 0
          };
        });

        const retention = customerData.retention || {};
        setReportData(prev => ({
          ...prev,
          customers: {
            demographics,
            acquisition: [], // Would need source tracking
            retention: {
              newCustomers: parseInt(retention.new_customers_30d) || 0,
              returningCustomers: parseInt(retention.customers_with_applications) || 0,
              retentionRate: 0, // Would need calculation
              avgCustomerValue: 0 // Would need revenue data
            }
          }
        }));
      }
    } catch (err) {
      console.error('Error loading report data:', err);
      setError(err.message || 'Failed to load report data');
      showError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Mock data - replace with API calls
  const oldReportData = {
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

  const exportToPDF = () => {
    try {
      // Get the report content
      const reportContent = document.querySelector('.space-y-6');
      if (!reportContent) {
        showError('Report content not found');
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showError('Popup blocked. Please allow popups to export PDF.');
        return;
      }

      // Get report title
      const reportTitle = document.querySelector('h1')?.textContent || 'Report';
      const periodLabel = selectedPeriod === '7days' ? 'Last 7 Days' :
                         selectedPeriod === '30days' ? 'Last 30 Days' :
                         selectedPeriod === '90days' ? 'Last 90 Days' :
                         selectedPeriod === '1year' ? 'Last Year' : 'All Time';
      const reportTypeLabel = reportTypes.find(t => t.value === selectedReport)?.label || 'Report';

      // Create HTML content for PDF
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${reportTitle} - ${reportTypeLabel}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #333;
              }
              h1 { color: #1f2937; margin-bottom: 10px; }
              h2 { color: #374151; margin-top: 20px; margin-bottom: 10px; }
              h3 { color: #4b5563; margin-top: 15px; margin-bottom: 8px; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f3f4f6;
                font-weight: bold;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
              }
              .stat-card {
                border: 1px solid #e5e7eb;
                padding: 15px;
                border-radius: 4px;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #111827;
              }
              .stat-label {
                font-size: 14px;
                color: #6b7280;
                margin-top: 5px;
              }
              @media print {
                body { padding: 10px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${reportTitle}</h1>
            <p><strong>Report Type:</strong> ${reportTypeLabel}</p>
            <p><strong>Period:</strong> ${periodLabel}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <hr style="margin: 20px 0;">
            ${generateReportHTML()}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        showSuccess('PDF export initiated. Use your browser\'s print dialog to save as PDF.');
      }, 250);
    } catch (err) {
      console.error('Export PDF error:', err);
      showError('Failed to export PDF');
    }
  };

  const generateReportHTML = () => {
    let html = '';
    
    if (selectedReport === 'overview') {
      html += `
        <h2>Overview Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${reportData.overview.totalApplications}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.overview.totalCustomers}</div>
            <div class="stat-label">Total Customers</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatPrice(reportData.overview.totalRevenue)}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.overview.successRate}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>
      `;
    } else if (selectedReport === 'applications') {
      html += '<h2>Applications Report</h2>';
      
      if (reportData.applications.byStatus?.length > 0) {
        html += '<h3>Applications by Status</h3><table><tr><th>Status</th><th>Count</th><th>Percentage</th></tr>';
        reportData.applications.byStatus.forEach(item => {
          html += `<tr><td>${item.status}</td><td>${item.count}</td><td>${item.percentage}%</td></tr>`;
        });
        html += '</table>';
      }
      
      if (reportData.applications.byCategory?.length > 0) {
        html += '<h3>Applications by Category</h3><table><tr><th>Category</th><th>Count</th><th>Revenue</th></tr>';
        reportData.applications.byCategory.forEach(item => {
          html += `<tr><td>${item.category}</td><td>${item.count}</td><td>${formatPrice(item.revenue)}</td></tr>`;
        });
        html += '</table>';
      }
    } else if (selectedReport === 'revenue') {
      html += '<h2>Revenue Report</h2>';
      
      if (reportData.revenue.monthly?.length > 0) {
        html += '<h3>Monthly Revenue</h3><table><tr><th>Month</th><th>Revenue</th><th>Applications</th><th>Avg Revenue</th></tr>';
        reportData.revenue.monthly.forEach(item => {
          html += `<tr><td>${item.month}</td><td>${formatPrice(item.revenue)}</td><td>${item.applications}</td><td>${formatPrice(item.avgRevenue)}</td></tr>`;
        });
        html += '</table>';
      }
    } else if (selectedReport === 'staff') {
      html += '<h2>Staff Performance Report</h2>';
      
      if (reportData.staff.performance?.length > 0) {
        html += '<h3>Staff Performance</h3><table><tr><th>Staff Member</th><th>Applications</th><th>Success Rate</th><th>Revenue</th></tr>';
        reportData.staff.performance.forEach(item => {
          html += `<tr><td>${item.name}</td><td>${item.applications}</td><td>${item.successRate}%</td><td>${formatPrice(item.revenue)}</td></tr>`;
        });
        html += '</table>';
      }
    }
    
    return html;
  };

  const exportToExcel = () => {
    try {
      let csvContent = '';
      const reportTypeLabel = reportTypes.find(t => t.value === selectedReport)?.label || 'Report';
      const periodLabel = selectedPeriod === '7days' ? 'Last 7 Days' :
                         selectedPeriod === '30days' ? 'Last 30 Days' :
                         selectedPeriod === '90days' ? 'Last 90 Days' :
                         selectedPeriod === '1year' ? 'Last Year' : 'All Time';
      
      // Add header
      csvContent += `${reportTypeLabel} - ${periodLabel}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      if (selectedReport === 'overview') {
        csvContent += 'Overview Statistics\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Total Applications,${reportData.overview.totalApplications}\n`;
        csvContent += `Total Customers,${reportData.overview.totalCustomers}\n`;
        csvContent += `Total Revenue,${reportData.overview.totalRevenue}\n`;
        csvContent += `Success Rate,${reportData.overview.successRate}%\n`;
        csvContent += `Avg Processing Time,${reportData.overview.avgProcessingTime}\n`;
      } else if (selectedReport === 'applications') {
        csvContent += 'Applications by Status\n';
        csvContent += 'Status,Count,Percentage\n';
        reportData.applications.byStatus?.forEach(item => {
          csvContent += `${item.status},${item.count},${item.percentage}%\n`;
        });
        
        csvContent += '\nApplications by Category\n';
        csvContent += 'Category,Count,Revenue\n';
        reportData.applications.byCategory?.forEach(item => {
          csvContent += `${item.category},${item.count},${item.revenue}\n`;
        });
      } else if (selectedReport === 'revenue') {
        csvContent += 'Monthly Revenue\n';
        csvContent += 'Month,Revenue,Applications,Avg Revenue\n';
        reportData.revenue.monthly?.forEach(item => {
          csvContent += `${item.month},${item.revenue},${item.applications},${item.avgRevenue}\n`;
        });
      } else if (selectedReport === 'staff') {
        csvContent += 'Staff Performance\n';
        csvContent += 'Staff Member,Applications,Success Rate,Revenue\n';
        reportData.staff.performance?.forEach(item => {
          csvContent += `${item.name},${item.applications},${item.successRate}%,${item.revenue}\n`;
        });
      }
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportTypeLabel}_${periodLabel}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess('Excel (CSV) file downloaded successfully');
    } catch (err) {
      console.error('Export Excel error:', err);
      showError('Failed to export Excel');
    }
  };

  const exportReport = () => {
    // Default export (same as PDF)
    exportToPDF();
  };

  if (loading && !reportData.overview.totalApplications) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="card text-center py-12">
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="card text-center py-12">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={loadReportData}
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
          {hasPermission(user, 'reports.export') && (
            <>
              <button onClick={exportToPDF} className="btn-primary flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export PDF</span>
              </button>
              <button onClick={exportToExcel} className="btn-secondary flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export Excel</span>
              </button>
            </>
          )}
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
                  {reportData.overview.monthlyGrowth > 0 && (
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{reportData.overview.monthlyGrowth}% from last month
                    </p>
                  )}
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
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(reportData.overview.totalRevenue)}</p>
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
              {reportData.applications.byStatus.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No application data available</div>
              ) : (
                <div className="space-y-3">
                  {reportData.applications.byStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          item.status?.toLowerCase().includes('approved') ? 'bg-green-500' :
                          item.status?.toLowerCase().includes('review') ? 'bg-blue-500' :
                          item.status?.toLowerCase().includes('pending') ? 'bg-yellow-500' :
                          item.status?.toLowerCase().includes('draft') ? 'bg-gray-500' :
                          item.status?.toLowerCase().includes('rejected') ? 'bg-red-500' :
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
              )}
            </div>

            {/* Monthly Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Applications Trend</h3>
              {reportData.applications.monthlyTrend.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No trend data available</div>
              ) : (
                <div className="space-y-3">
                  {reportData.applications.monthlyTrend.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{item.applications} apps</span>
                        {item.revenue > 0 && (
                          <span className="text-sm font-bold text-gray-900">{formatPrice(item.revenue)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  {reportData.applications.byCategory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No category data available
                      </td>
                    </tr>
                  ) : (
                    reportData.applications.byCategory.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.revenue > 0 ? formatPrice(item.revenue) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          N/A
                        </td>
                      </tr>
                    ))
                  )}
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
                  {reportData.staff.performance.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No staff performance data available
                      </td>
                    </tr>
                  ) : (
                    reportData.staff.performance.map((staff, index) => (
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
                          {staff.revenue > 0 ? formatPrice(staff.revenue) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {reportData.staff.workload[index] && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              reportData.staff.workload[index].current <= 5 ? 'bg-green-100 text-green-800' :
                              reportData.staff.workload[index].current <= 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reportData.staff.workload[index].current} active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(reportData.overview.totalRevenue)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(150)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(reportData.customers.retention.avgCustomerValue)}</p>
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
                  {reportData.revenue.byService.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No service revenue data available</div>
                  ) : (
                    reportData.revenue.byService.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.revenue > 0 ? `$${item.revenue.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.avgPrice > 0 ? formatPrice(item.avgPrice) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${reportData.overview.totalRevenue > 0 ? (item.revenue / reportData.overview.totalRevenue) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {reportData.overview.totalRevenue > 0 ? ((item.revenue / reportData.overview.totalRevenue) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              {reportData.revenue.monthly.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No monthly revenue data available</div>
              ) : (
                <div className="space-y-3">
                  {reportData.revenue.monthly.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{item.applications} apps</span>
                        {item.revenue > 0 && (
                          <span className="text-sm font-bold text-gray-900">{formatPrice(item.revenue)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              {reportData.revenue.paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payment method data available</div>
              ) : (
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
                        <span className="text-sm font-bold text-gray-900">{formatPrice(item.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(reportData.customers.retention.avgCustomerValue)}</p>
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
              {reportData.customers.demographics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No demographics data available</div>
              ) : (
                <div className="space-y-3">
                  {reportData.customers.demographics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.ageGroup}</span>
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
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition Sources</h3>
              {reportData.customers.acquisition.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No acquisition data available</div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={exportToPDF} className="btn-outline flex items-center justify-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export to PDF</span>
          </button>
          <button onClick={exportToExcel} className="btn-outline flex items-center justify-center space-x-2">
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
