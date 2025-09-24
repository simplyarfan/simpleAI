import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { analyticsAPI, supportAPI } from '../../utils/api';
import {
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  Activity,
  Database,
  UserCheck,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Eye,
  RefreshCw,
  LogOut,
  User,
  Server,
  Zap,
  Globe,
  FileText,
  Calendar
} from 'lucide-react';

export default function ImprovedSuperAdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    pendingTickets: 0,
    systemHealth: 'Good',
    apiCalls: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analyticsResponse = await analyticsAPI.getDashboard();
      if (analyticsResponse.success) {
        const analyticsData = analyticsResponse.data;
        setStats(prev => ({
          ...prev,
          totalUsers: analyticsData.totalUsers || 0,
          activeUsers: analyticsData.activeUsers || 0,
          apiCalls: analyticsData.apiCalls || 0
        }));
      }

      // Fetch support data
      const supportResponse = await supportAPI.getTickets();
      if (supportResponse.success) {
        const tickets = supportResponse.data || [];
        setStats(prev => ({
          ...prev,
          totalTickets: tickets.length,
          pendingTickets: tickets.filter(t => t.status === 'open').length
        }));
        
        // Set recent activity from tickets
        setRecentActivity(tickets.slice(0, 5).map(ticket => ({
          id: ticket.id,
          type: 'ticket',
          title: ticket.subject,
          status: ticket.status,
          user: ticket.user_name,
          time: new Date(ticket.created_at).toLocaleString()
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      route: '/admin/users',
      description: 'Registered users'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      route: '/admin/users',
      description: 'Currently active'
    },
    {
      title: 'Support Tickets',
      value: stats.totalTickets,
      icon: MessageSquare,
      route: '/admin/tickets',
      description: 'Total tickets'
    },
    {
      title: 'System Health',
      value: stats.systemHealth,
      icon: Activity,
      route: '/admin/system',
      description: 'Overall status'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      route: '/admin/users',
      color: 'hover:bg-blue-500/10'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View platform analytics and insights',
      icon: BarChart3,
      route: '/admin/analytics',
      color: 'hover:bg-green-500/10'
    },
    {
      title: 'Support Management',
      description: 'Handle support tickets and issues',
      icon: MessageSquare,
      route: '/admin/tickets',
      color: 'hover:bg-purple-500/10'
    },
    {
      title: 'System Health',
      description: 'Monitor system performance and health',
      icon: Activity,
      route: '/admin/system',
      color: 'hover:bg-orange-500/10'
    },
    {
      title: 'Database Management',
      description: 'Manage database and data integrity',
      icon: Database,
      route: '/admin/database',
      color: 'hover:bg-red-500/10'
    },
    {
      title: 'API Monitoring',
      description: 'Monitor API performance and usage',
      icon: Globe,
      route: '/admin/api',
      color: 'hover:bg-cyan-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Super Admin Dashboard</h1>
                  <p className="text-sm text-gray-400">Welcome back, {user?.first_name || 'Admin'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchDashboardData}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Profile Settings"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={stat.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(stat.route)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white font-medium">{stat.title}</div>
                <div className="text-xs text-gray-400">{stat.description}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Actions</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={action.title}
                    className={`bg-white/5 border border-white/10 rounded-xl p-4 ${action.color} transition-all duration-300 cursor-pointer group`}
                    onClick={() => router.push(action.route)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{action.title}</h4>
                        <p className="text-sm text-gray-400">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </h3>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            by {activity.user} • {activity.time}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                          {activity.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>System Status</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-white" />
                    <div>
                      <p className="font-medium text-white">API Status</p>
                      <p className="text-sm text-gray-400">All systems operational</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-white" />
                    <div>
                      <p className="font-medium text-white">Database</p>
                      <p className="text-sm text-gray-400">Connected and healthy</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-white" />
                    <div>
                      <p className="font-medium text-white">AI Services</p>
                      <p className="text-sm text-gray-400">Running smoothly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
