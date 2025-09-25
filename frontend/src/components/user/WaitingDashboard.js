import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  Brain,
  Sparkles,
  Settings,
  User,
  LogOut,
  Menu,
  Search,
  Bell,
  Plus,
  MessageSquare,
  Users,
  Mail,
  Phone
} from 'lucide-react';

const WaitingDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const quickActions = [
    { name: 'Create Ticket', icon: Plus, route: '/support/create-ticket' },
    { name: 'My Tickets', icon: MessageSquare, route: '/support/my-tickets' },
    { name: 'Profile Settings', icon: User, route: '/profile' }
  ];

  const contactInfo = [
    {
      id: 'admin',
      name: 'Contact Admin',
      description: 'Reach out to request department assignment',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      action: () => router.push('/support/create-ticket')
    },
    {
      id: 'email',
      name: 'Email Support',
      description: 'Send an email for assistance',
      icon: Mail,
      color: 'from-green-500 to-emerald-600',
      action: () => window.open('mailto:support@securemaxtech.com')
    },
    {
      id: 'phone',
      name: 'Phone Support',
      description: 'Call us during business hours',
      icon: Phone,
      color: 'from-purple-500 to-indigo-600',
      action: () => window.open('tel:+1234567890')
    }
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
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Waiting for Assignment</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">Your account is being reviewed</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
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
              <p className="text-xs text-gray-500 truncate">Pending Assignment</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Waiting for Assignment</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.first_name}!</p>
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
                <h2 className="text-2xl font-bold mb-2">Welcome to Nexus AI Platform!</h2>
                <p className="text-orange-100">
                  Your account is being reviewed. You'll be assigned to a department soon.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Clock className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Under Review</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our admin team is reviewing your account and will assign you to the appropriate department based on your role and responsibilities.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>What happens next?</strong> Once assigned, you'll have access to your department's AI agents and tools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {contactInfo.map((contact) => (
              <div
                key={contact.id}
                onClick={contact.action}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{contact.description}</p>
                    <div className="flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700">
                      <span>Get Help</span>
                      <Plus className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
};

export default WaitingDashboard;
