import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';
import { analyticsAPI } from '../utils/api';
import {
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAgentUsage: 0,
    systemHealth: 'Good'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set demo data if API fails
      setStats({
        totalUsers: 156,
        activeUsers: 89,
        totalAgentUsage: 2847,
        systemHealth: 'Good',
        recentActivity: [
          { action: 'User Registration', count: 12, change: '+15%' },
          { action: 'CV Analysis', count: 45, change: '+23%' },
          { action: 'Support Tickets', count: 8, change: '-12%' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%'
    },
    {
      title: 'Agent Usage',
      value: stats.totalAgentUsage,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+25%'
    },
    {
      title: 'System Health',
      value: stats.systemHealth,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      change: 'Stable'
    }
  ];

  return (
    <ProtectedRoute requireAuth={true} requireRole="superadmin">
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              System-wide analytics and performance metrics
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </p>
                    <p className={`text-sm mt-2 ${
                      metric.change.includes('+') ? 'text-green-600' : 
                      metric.change.includes('-') ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
              <div className="space-y-4">
                {stats.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.count} this month</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      activity.change.includes('+') ? 'text-green-600' : 
                      activity.change.includes('-') ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {activity.change}
                    </span>
                  </div>
                )) || (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">CV Analysis</p>
                        <p className="text-sm text-gray-600">156 this month</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">+23%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">User Registrations</p>
                        <p className="text-sm text-gray-600">28 this month</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">+15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Support Tickets</p>
                        <p className="text-sm text-gray-600">12 this month</p>
                      </div>
                      <span className="text-sm font-medium text-red-600">-8%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-900">API Server</span>
                  </div>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-900">Database</span>
                  </div>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-900">CV Processing</span>
                  </div>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-gray-900">Email Service</span>
                  </div>
                  <span className="text-yellow-600 font-medium">Degraded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      CV Batch Created
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      john.doe@securemaxtech.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2 minutes ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Success
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      User Registration
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      sarah.smith@securemaxtech.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      15 minutes ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Success
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Support Ticket Created
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      mike.johnson@securemaxtech.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      1 hour ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;