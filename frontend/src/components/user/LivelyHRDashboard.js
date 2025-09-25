import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { 
  Users, 
  FileText, 
  Calendar, 
  Settings,
  LogOut,
  User,
  Brain,
  MessageSquare,
  BarChart3,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export default function LivelyHRDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const aiAgents = [
    {
      id: 'cv-intelligence',
      name: 'CV Intelligence',
      description: 'Analyze resumes and rank candidates automatically',
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
      route: '/cv-intelligence'
    },
    {
      id: 'interview-coordinator',
      name: 'Interview Coordinator',
      description: 'Schedule and manage interview processes',
      icon: Calendar,
      color: 'from-green-500 to-emerald-600',
      route: '/interview-coordinator'
    }
  ];

  const quickActions = [
    { name: 'Create Ticket', icon: Plus, route: '/support/create-ticket' },
    { name: 'My Tickets', icon: MessageSquare, route: '/support/my-tickets' },
    { name: 'Profile Settings', icon: User, route: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">Nexus</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Agents</p>
            </div>
            {aiAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => router.push(agent.route)}
                className="w-full flex items-center px-3 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center mr-3`}>
                  <agent.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-1">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</p>
            </div>
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => router.push(action.route)}
                className="w-full flex items-center px-3 py-2 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <action.icon className="w-5 h-5 mr-3 text-gray-400" />
                <span className="text-sm font-medium">{action.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">HR Department</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/profile')}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">HR Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.first_name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 pb-20">
          {/* Welcome section */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">HR Intelligence Hub</h2>
                <p className="text-orange-100">
                  Access your AI-powered HR tools and manage recruitment processes
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {aiAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => router.push(agent.route)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <agent.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
                    <div className="flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700">
                      <span>Launch Agent</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
