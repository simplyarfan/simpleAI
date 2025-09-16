import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import { analyticsAPI } from '../../utils/api';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Shield,
  Settings,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'superadmin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching dashboard data...');
      const response = await analyticsAPI.getDashboard();
      console.log('Dashboard API response:', response);
      
      if (response.data?.success) {
        setDashboardData(response.data.data);
      } else {
        console.error('Dashboard API failed:', response.data);
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="mt-2 text-blue-100">
                Welcome back, {user.first_name}! System overview and management
              </p>
            </div>
            <div className="flex items-center text-blue-100">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Last login: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.totalUsers || 0}
                    </p>
                    <p className="text-sm text-green-600">
                      {dashboardData?.userGrowth || '+0% from last month'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.activeUsers || 0}
                    </p>
                    <p className="text-sm text-green-600">
                      {dashboardData?.activeGrowth || '+0% from last month'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Agent Usage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.agentUsage || 0}
                    </p>
                    <p className="text-sm text-green-600">
                      {dashboardData?.agentGrowth || '+0% from last month'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">System Health</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.systemHealth || 'Good'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dashboardData?.systemStatus || 'Stable from last month'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Overview Section */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
                <p className="text-sm text-gray-600">Use the admin tools below to manage your system</p>
              </div>
            </div>

            {/* Admin Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8" />
                  <span className="text-blue-100 text-sm">4 tools available</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-blue-100 text-sm">Manage users, roles, and permissions</p>
              </button>

              <button
                onClick={() => router.push('/analytics')}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-8 w-8" />
                  <span className="text-green-100 text-sm">Analytics</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
                <p className="text-green-100 text-sm">System analytics and usage reports</p>
              </button>

              <button
                onClick={() => router.push('/admin/system')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <Settings className="h-8 w-8" />
                  <span className="text-purple-100 text-sm">System</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">System Health</h3>
                <p className="text-purple-100 text-sm">Monitor system performance</p>
              </button>

              <button
                onClick={() => router.push('/admin/tickets')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <PieChart className="h-8 w-8" />
                  <span className="text-orange-100 text-sm">Support</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Support Tickets</h3>
                <p className="text-orange-100 text-sm">Handle user support requests</p>
              </button>
            </div>

            {/* Recent Activity Section */}
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.user}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Information */}
            {!dashboardData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Dashboard data not available
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700">
                      Unable to load analytics data. This may be due to API connectivity issues. Check the console for more details.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
