import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import { analyticsAPI } from '../../utils/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Download,
  Calendar,
  Eye,
  MousePointer,
  Clock,
  Zap
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBatches: 0,
    totalTickets: 0,
    systemHealth: 'Good'
  });
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

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
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard analytics
      const dashboardResponse = await analyticsAPI.getDashboard();
      if (dashboardResponse.data?.success) {
        setAnalytics(dashboardResponse.data.data);
      }

      // Fetch user analytics
      const userResponse = await analyticsAPI.getUserAnalytics({ timeframe: timeRange });
      if (userResponse.data?.success) {
        setUserAnalytics(userResponse.data.data.userStats || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for demonstration
      setAnalytics({
        totalUsers: 156,
        activeUsers: 89,
        totalBatches: 45,
        totalTickets: 23,
        systemHealth: 'Good'
      });
      setUserAnalytics([
        { role: 'user', count: 120, active_count: 75 },
        { role: 'admin', count: 25, active_count: 12 },
        { role: 'superadmin', count: 11, active_count: 2 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const mockChartData = [
    { name: 'Mon', users: 45, sessions: 120, cvs: 23 },
    { name: 'Tue', users: 52, sessions: 145, cvs: 31 },
    { name: 'Wed', users: 48, sessions: 132, cvs: 28 },
    { name: 'Thu', users: 61, sessions: 167, cvs: 42 },
    { name: 'Fri', users: 55, sessions: 151, cvs: 35 },
    { name: 'Sat', users: 32, sessions: 89, cvs: 18 },
    { name: 'Sun', users: 28, sessions: 76, cvs: 15 }
  ];

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
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
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">CV Batches</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{analytics.totalBatches}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +15%
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
                {mockChartData.map((day, index) => (
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
                {userAnalytics.map((roleData, index) => {
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
                })}
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
              <ul className="-mb-8">
                {[
                  { action: 'New user registered', user: 'john@securemaxtech.com', time: '2 minutes ago', type: 'user' },
                  { action: 'CV batch processed', user: 'jane@securemaxtech.com', time: '15 minutes ago', type: 'cv' },
                  { action: 'Support ticket created', user: 'mike@securemaxtech.com', time: '1 hour ago', type: 'ticket' },
                  { action: 'Analytics report generated', user: 'admin@securemaxtech.com', time: '2 hours ago', type: 'report' },
                  { action: 'System backup completed', user: 'System', time: '4 hours ago', type: 'system' }
                ].map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== 4 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'user' ? 'bg-blue-500' :
                            activity.type === 'cv' ? 'bg-green-500' :
                            activity.type === 'ticket' ? 'bg-orange-500' :
                            activity.type === 'report' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}>
                            {activity.type === 'user' && <Users className="w-4 h-4 text-white" />}
                            {activity.type === 'cv' && <Eye className="w-4 h-4 text-white" />}
                            {activity.type === 'ticket' && <MousePointer className="w-4 h-4 text-white" />}
                            {activity.type === 'report' && <BarChart3 className="w-4 h-4 text-white" />}
                            {activity.type === 'system' && <Activity className="w-4 h-4 text-white" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.action} by <span className="font-medium text-gray-900">{activity.user}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
