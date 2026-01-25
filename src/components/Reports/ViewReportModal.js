import React from 'react';
import { X, BarChart3, TrendingUp, Download, Calendar, Users, FileText, DollarSign, PieChart } from 'lucide-react';

const ViewReportModal = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
          <div className="flex items-center space-x-3">
            <button className="btn-outline flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Report Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.type}</p>
                <p className="text-sm text-gray-600">Generated on {report.generatedDate}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {report.status}
              </span>
              <p className="text-sm text-gray-500 mt-1">Period: {report.period}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Key Metrics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{report.metrics.totalApplications}</div>
                <div className="text-sm text-blue-600">Total Applications</div>
                <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{report.metrics.growth}%
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{report.metrics.totalCustomers}</div>
                <div className="text-sm text-green-600">Total Customers</div>
                <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">${report.metrics.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-purple-600">Total Revenue</div>
                <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15%
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <PieChart className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">{report.metrics.successRate}%</div>
                <div className="text-sm text-yellow-600">Success Rate</div>
                <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1%
                </div>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Report Summary</h4>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.summary || `This report provides a comprehensive overview of business performance for the ${report.period} period. 
                Key highlights include a ${report.metrics.growth}% increase in applications, reaching ${report.metrics.totalApplications} total applications. 
                Revenue has grown by 15% to $${report.metrics.totalRevenue.toLocaleString()}, while maintaining a ${report.metrics.successRate}% success rate. 
                Customer base has expanded to ${report.metrics.totalCustomers} active customers.`}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Detailed Breakdown</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications by Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Applications by Status</h5>
                <div className="space-y-2">
                  {report.breakdown?.applicationsByStatus?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          item.status === 'Completed' ? 'bg-green-500' :
                          item.status === 'In Progress' ? 'bg-blue-500' :
                          item.status === 'Pending' ? 'bg-yellow-500' :
                          item.status === 'Draft' ? 'bg-gray-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Category */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Revenue by Category</h5>
                <div className="space-y-2">
                  {report.breakdown?.revenueByCategory?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.category}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">${item.revenue.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.count} apps)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Monthly Trend</h4>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                {report.breakdown?.monthlyTrend?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{item.applications} applications</span>
                      <span className="text-sm font-bold text-gray-900">${item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Report Information</h4>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Report Type:</span>
                    <span className="font-medium text-gray-900">{report.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Generated:</span>
                    <span className="font-medium text-gray-900">{report.generatedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium text-gray-900">{report.period}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">{report.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Generated By:</span>
                    <span className="font-medium text-gray-900">System</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium text-gray-900">2.4 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
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

export default ViewReportModal;




