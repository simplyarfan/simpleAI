import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import ErrorBoundary from '../../components/ErrorBoundary';
import { analyticsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  Eye,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Analytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    cvBatches: 0,
    systemHealth: 'Good'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.email !== 'syedarfan@securemaxtech.com')) {
      router.push('/');
      return;
    }
    if (user) {
      fetchAnalytics();
    }
  }, [user, loading, router]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching real analytics data...');
      
      // Fetch dashboard analytics
      const dashboardResponse = await analyticsAPI.getDashboardAnalytics();
      console.log('📊 Dashboard response:', dashboardResponse);
      
      if (dashboardResponse && dashboardResponse.data) {
        const data = dashboardResponse.data;
        setAnalyticsData({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalTickets: data.totalTickets || 0,
          resolvedTickets: (data.totalTickets || 0) - (data.openTickets || 0),
          cvBatches: data.totalBatches || 0,
          systemHealth: data.systemHealth || 'Good'
        });
      }
      
      // Fetch user analytics
      const userResponse = await analyticsAPI.getUserAnalytics();
      console.log('👥 User analytics response:', userResponse);
      
      if (userResponse && userResponse.data && userResponse.data.userStats) {
        const userStats = userResponse.data.userStats.map(stat => ({
          department: stat.role || 'Unknown',
          users: parseInt(stat.count) || 0,
          active: parseInt(stat.active_count) || 0
        }));
        setUserAnalytics(userStats);
      }
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      toast.error(`Failed to fetch analytics: ${error.response?.data?.message || error.message}`);
      
      // Set default values on error
      setAnalyticsData({
        totalUsers: 0,
        activeUsers: 0,
        totalTickets: 0,
        resolvedTickets: 0,
        cvBatches: 0,
        systemHealth: 'Unknown'
      });
      setUserAnalytics([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== 'syedarfan@securemaxtech.com') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-green-400 text-sm mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 bg-white/10 border border-white/20 rounded-xl`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ left: '10%', top: '20%' }} />
          <div className="absolute w-64 h-64 bg-blue-500/3 rounded-full blur-2xl" style={{ right: '10%', bottom: '20%' }} />
        </div>

        <Head>
          <title>Analytics - SimpleAI</title>
          <meta name="description" content="Platform analytics and insights" />
        </Head>
        
        <div className="relative z-10">
        
          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back to Dashboard Button */}
            <div className="mb-6">
              <motion.button
                onClick={() => router.push('/superadmin')}
                className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </motion.button>
            </div>
            
            {/* Header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 border border-white/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Analytics Dashboard</h1>
                      <p className="text-gray-400">Platform insights and performance metrics</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={fetchAnalytics}
                    className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                <span className="ml-3 text-gray-400">Loading analytics...</span>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Users"
                    value={analyticsData.totalUsers}
                    icon={Users}
                    color="text-blue-400"
                    trend="+12% this month"
                  />
                  <StatCard
                    title="Active Users"
                    value={analyticsData.activeUsers}
                    icon={Activity}
                    color="text-green-400"
                    trend="+8% this week"
                  />
                  <StatCard
                    title="Support Tickets"
                    value={analyticsData.totalTickets}
                    icon={Calendar}
                    color="text-yellow-400"
                    trend="78% resolved"
                  />
                  <StatCard
                    title="CV Batches"
                    value={analyticsData.cvBatches}
                    icon={BarChart3}
                    color="text-purple-400"
                    trend="+15% this month"
                  />
                </div>

                {/* Department Analytics */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Department Analytics</h2>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">Department</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">Total Users</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">Active Users</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">Activity Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAnalytics.map((dept, index) => (
                          <motion.tr 
                            key={dept.department}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-xs font-bold text-white">
                                    {dept.department.split(' ').map(word => word[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{dept.department}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-300">{dept.users}</td>
                            <td className="py-4 px-4 text-gray-300">{dept.active}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-full bg-white/10 rounded-full h-2 mr-3">
                                  <div 
                                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(dept.active / dept.users) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-300 min-w-[3rem]">
                                  {Math.round((dept.active / dept.users) * 100)}%
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* System Health */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-white font-medium mb-1">Server Status</h3>
                      <p className="text-green-400 text-sm">Online</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-white font-medium mb-1">Performance</h3>
                      <p className="text-blue-400 text-sm">Excellent</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-white font-medium mb-1">AI Services</h3>
                      <p className="text-purple-400 text-sm">Active</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
