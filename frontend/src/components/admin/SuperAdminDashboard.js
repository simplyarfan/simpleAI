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
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Super Admin Dashboard - Enterprise AI Hub</title>
          <meta name="description" content="Super admin dashboard for Enterprise AI Hub" />
        </Head>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:px-8 sm:py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Super Admin Dashboard
                    </h1>
                    <p className="mt-2 text-purple-100 text-lg">
                      Welcome back, {user?.first_name}!
                    </p>
                    <div className="mt-4 flex items-center text-purple-100">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Last login: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                      <Settings className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Admin Tools */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Tools</h2>
              <span className="text-sm text-gray-500">
                {adminModules.length} tools available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {adminModules.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <tool.icon className="w-8 h-8" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold">{tool.title}</h3>
                        <p className="text-sm opacity-90 mt-1">{tool.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <ul className="space-y-2 mb-6">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={tool.href}
                      className="group w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      Access Tool
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
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
