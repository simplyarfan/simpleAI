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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        </div>

        <Head>
          <title>Analytics & Reports - simpleAI</title>
          <meta name="description" content="View detailed analytics and generate reports" />
        </Head>
        
        <Header />
        
        <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/superadmin')}
            className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl mr-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  Analytics & Reports
                </h1>
                <p className="text-gray-300 text-lg">
                  View detailed analytics and generate reports
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">{analytics.totalUsers}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Active Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">{analytics.activeUsers}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Support Tickets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">{analytics.totalTickets}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">System Health</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">{analytics.systemHealth}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Usage Overview</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Last 7 days</span>
              </div>
            </div>
            
            {/* Simple Bar Chart Representation */}
            <div className="space-y-4">
              {Array.isArray(chartData) && chartData.length > 0 ? chartData.map((day, index) => (
                <div key={day.name} className="flex items-center space-x-4">
                  <div className="w-8 text-sm text-gray-300">{day.name}</div>
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full" 
                        style={{ width: `${(day.users / Math.max(...chartData.map(d => d.users))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-300 w-8">{day.users}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-300 py-8">
                  No usage data available
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
              <span>Users per day</span>
              <span>Peak: {Array.isArray(chartData) && chartData.length > 0 ? Math.max(...chartData.map(d => d.users)) : 0} users</span>
            </div>
          </div>

          {/* User Roles Distribution */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-lg font-medium text-white mb-6">User Distribution</h3>
            
            <div className="space-y-4">
              {Array.isArray(userAnalytics) && userAnalytics.length > 0 ? userAnalytics.map((roleData, index) => {
                const percentage = analytics.totalUsers > 0 ? (roleData.count / analytics.totalUsers * 100) : 0;
                const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-600'];
                
                return (
                  <div key={roleData.role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm font-medium text-white capitalize">
                        {roleData.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-300">{roleData.count}</span>
                      <span className="text-xs text-gray-400">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-gray-300 py-4">
                  No user analytics data available
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Active Rate</span>
                <span className="font-medium text-white">
                  {analytics.totalUsers > 0 ? ((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <h3 className="text-lg font-medium text-white mb-6">Recent Activity</h3>
          
          <div className="flow-root">
            {Array.isArray(analytics.recentActivity) && analytics.recentActivity.length > 0 ? (
              <ul className="-mb-8">
                {analytics.recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== analytics.recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/20"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            <Activity className="w-4 h-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-300">
                              {activity.action} by <span className="font-medium text-white">{activity.details}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-300 flex items-center">
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
              <div className="text-center text-gray-300 py-8">
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
