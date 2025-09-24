import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { 
  Users, 
  FileText, 
  Calendar, 
  Settings,
  LogOut,
  User,
  ArrowRight
} from 'lucide-react';

export default function CleanHRDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Only show real agents - no mock data
  const hrAgents = [
    {
      id: 'cv-intelligence',
      name: 'CV Intelligence',
      description: 'AI-powered resume analysis and candidate ranking',
      route: '/cv-intelligence',
      available: true,
      icon: FileText
    },
    {
      id: 'interview-coordinator',
      name: 'Interview Coordinator', 
      description: 'Smart scheduling & interview automation',
      route: '/interview-coordinator',
      available: true,
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-medium">Human Resources Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.first_name || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
        <div className="max-w-6xl mx-auto">
          {/* HR Agents */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-6">Human Resources Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hrAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => router.push(agent.route)}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <agent.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-medium text-white">{agent.name}</h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{agent.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Status: {agent.available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${agent.available ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-medium mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors text-left"
              >
                <Settings className="w-5 h-5 mb-2" />
                <div className="font-medium text-sm">Profile Settings</div>
                <div className="text-xs text-gray-400">Manage your account</div>
              </button>

              <button
                onClick={() => router.push('/support/create-ticket')}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors text-left"
              >
                <FileText className="w-5 h-5 mb-2" />
                <div className="font-medium text-sm">Support Tickets</div>
                <div className="text-xs text-gray-400">Get help and support</div>
              </button>

              <button
                onClick={() => router.push('/support/my-tickets')}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 mb-2" />
                <div className="font-medium text-sm">My Tickets</div>
                <div className="text-xs text-gray-400">View ticket history</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
