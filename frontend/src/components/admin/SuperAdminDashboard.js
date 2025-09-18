import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI, supportAPI } from '../../utils/api';
import {
  Brain,
  FileText,
  Users,
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Settings,
  AlertTriangle,
  MessageSquare,
  Activity,
  Database,
  UserCheck,
  Globe
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    pendingTickets: 0,
    systemHealth: 'Good',
    apiCalls: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const analyticsResponse = await analyticsAPI.getDashboard();
        if (analyticsResponse.success) {
          const analyticsData = analyticsResponse.data;
          
          setStats({
            totalUsers: analyticsData.totalUsers || 0,
            activeUsers: analyticsData.activeUsers || 0,
            totalTickets: analyticsData.totalTickets || 0,
            systemHealth: analyticsData.systemHealth || 'Good',
            apiCalls: analyticsData.apiCalls || 0
          });
          
          // Set recent activity from analytics
          setRecentActivity(analyticsData.recentActivity || []);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use empty arrays on error instead of fallback data
        setRecentActivity([]);
        setPendingTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const adminModules = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-indigo-600',
      features: ['User accounts', 'Role assignment', 'Access control', 'Activity monitoring']
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View detailed analytics and generate reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-green-500 to-teal-600',
      features: ['Usage analytics', 'Performance metrics', 'Custom reports', 'Data insights']
    },
    {
      id: 'support-tickets',
      title: 'Support Management',
      description: 'Manage user support requests and tickets',
      icon: MessageSquare,
      href: '/admin/tickets',
      color: 'from-orange-500 to-red-600',
      features: ['Ticket management', 'User queries', 'Response tracking', 'Priority handling']
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Monitor system performance and health',
      icon: Activity,
      href: '/admin/system',
      color: 'from-purple-500 to-pink-600',
      features: ['Server status', 'API monitoring', 'Error tracking', 'Performance alerts']
    }
  ];

  const quickStats = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      change: '+12%'
    },
    {
      name: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      change: '+8%'
    },
    {
      name: 'Support Tickets',
      value: stats.totalTickets,
      icon: MessageSquare,
      color: 'text-orange-600',
      change: '-5%'
    },
    {
      name: 'System Health',
      value: stats.systemHealth,
      icon: Shield,
      color: 'text-purple-600',
      change: 'Stable'
    }
  ];

  // Default fallback data if API fails
  const defaultRecentActivity = [
    {
      id: 1,
      type: 'user_registration',
      title: 'New user registered',
      description: 'john.doe@company.com joined the platform',
      time: '5 minutes ago',
      status: 'info'
    },
    {
      id: 2,
      type: 'support_ticket',
      title: 'New support ticket #2045',
      description: 'User reported CV analysis issue',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 3,
      type: 'system_alert',
      title: 'High API usage detected',
      description: 'CV Intelligence API usage above normal',
      time: '1 hour ago',
      status: 'alert'
    },
    {
      id: 4,
      type: 'user_activity',
      title: 'Bulk CV processing completed',
      description: 'User processed 50 CVs successfully',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  const defaultPendingTickets = [
    {
      id: 2045,
      user: 'john.doe@company.com',
      subject: 'CV Analysis not working',
      priority: 'High',
      created: '2 hours ago',
      status: 'Open'
    },
    {
      id: 2044,
      user: 'sarah.smith@company.com',
      subject: 'Export functionality issue',
      priority: 'Medium',
      created: '1 day ago',
      status: 'In Progress'
    },
    {
      id: 2043,
      user: 'mike.johnson@company.com',
      subject: 'Account access problem',
      priority: 'Low',
      created: '2 days ago',
      status: 'Open'
    }
  ];

  return (
      <div>
        <Head>
          <title>Super Admin Dashboard - simpleAI</title>
          <meta name="description" content="Super admin dashboard for simpleAI" />
        </Head>

        <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="px-6 py-8 sm:px-8 sm:py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="relative mr-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl blur opacity-30"></div>
                      </div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        simpleAI
                      </h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Super Admin Dashboard
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Welcome back, {user?.first_name}! 
                    </p>
                    <div className="mt-4 flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Last login: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <Settings className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Admin Tools */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Admin Tools</h2>
              <span className="text-sm text-gray-300 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                {adminModules.length} tools available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {adminModules.map((tool) => (
                <div
                  key={tool.id}
                  className="group bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:bg-white/15"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${tool.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <div className="relative flex items-center">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                        <tool.icon className="w-10 h-10" />
                      </div>
                      <div className="ml-6">
                        <h3 className="text-2xl font-bold">{tool.title}</h3>
                        <p className="text-sm opacity-90 mt-2">{tool.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <ul className="space-y-3 mb-8">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-300">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={tool.href}
                      className="group/btn w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Access Tool
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
  );
};

export default SuperAdminDashboard;
