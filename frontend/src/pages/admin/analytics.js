import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import { analyticsAPI } from '../../utils/api';
import Header from '../../components/shared/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Download,
  Calendar,
  Eye,
  MousePointer,
  ArrowLeft,
  Clock,
  Zap,
  MessageSquare
} from 'lucide-react';

// Dynamic data will be fetched from API

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    systemHealth: 'Good',
    usageData: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [chartData, setChartData] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState([]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'superadmin') {
        router.push('/');
      } else {
        fetchAnalytics();
      }
    }
  }, [user, loading, router, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch multiple analytics endpoints
      const [dashboardResponse, userAnalyticsResponse, chartDataResponse] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getUserAnalytics({ timeframe }),
        analyticsAPI.getCVAnalytics({ timeframe })
      ]);
      
      if (dashboardResponse.data.success) {
        const data = dashboardResponse.data.data;
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalTickets: data.totalTickets || 0,
          openTickets: data.openTickets || 0,
          systemHealth: data.systemHealth || 'Good',
          usageData: data.usageData || [],
          recentActivity: data.recentActivity || []
        });
      }
      
      if (userAnalyticsResponse.data.success) {
        setUserAnalytics(userAnalyticsResponse.data.data?.userStats || []);
      }
      
      if (chartDataResponse.data.success) {
        setChartData(chartDataResponse.data.data || []);
      }
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Throw error to trigger error boundary
      throw new Error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };


  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user.role !== 'superadmin') {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Analytics & Reports - Enterprise AI Hub</title>
          <meta name="description" content="View detailed analytics and generate reports" />
        </Head>
        
        <Header />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/superadmin')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-green-600" />
                Analytics & Reports
              </h1>
              <p className="mt-2 text-gray-600">
                View detailed analytics and generate reports
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{analytics.totalUsers}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{analytics.activeUsers}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Support Tickets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{analytics.totalTickets}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                      <span className="text-xs">({analytics.openTickets} open)</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{analytics.systemHealth}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      99.9%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Usage Overview</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Last 7 days</span>
              </div>
            </div>
            
            {/* Simple Bar Chart Representation */}
            <div className="space-y-4">
              {Array.isArray(chartData) && chartData.map((day, index) => (
                <div key={day.name} className="flex items-center space-x-4">
                  <div className="w-8 text-sm text-gray-600">{day.name}</div>
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(day.users / 70) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{day.users}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Users per day</span>
              <span>Peak: 61 users</span>
            </div>
          </div>

          {/* User Roles Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">User Distribution</h3>
            
            <div className="space-y-4">
              {Array.isArray(userAnalytics) && userAnalytics.length > 0 ? userAnalytics.map((roleData, index) => {
                const percentage = analytics.totalUsers > 0 ? (roleData.count / analytics.totalUsers * 100) : 0;
                const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-600'];
                
                return (
                  <div key={roleData.role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {roleData.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{roleData.count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-gray-500 py-4">
                  No user analytics data available
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Rate</span>
                <span className="font-medium text-gray-900">
                  {analytics.totalUsers > 0 ? ((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h3>
          
          <div className="flow-root">
            {Array.isArray(analytics.recentActivity) && analytics.recentActivity.length > 0 ? (
              <ul className="-mb-8">
                {analytics.recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== analytics.recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-blue-500">
                            <Activity className="w-4 h-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.action} by <span className="font-medium text-gray-900">{activity.details}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent activity data available
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
