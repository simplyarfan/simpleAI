import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../shared/Header';
import { 
  FileText, 
  Calendar, 
  Award, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  User,
  Upload,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  Sparkles,
  Play,
  ArrowRight
} from 'lucide-react';

const HRDashboard = () => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const agents = [
    {
      id: 'cv_intelligence',
      name: 'CV Intelligence',
      description: 'AI-powered resume parsing, analysis & ranking',
      icon: FileText,
      status: 'active',
      metrics: { processed: 1247, timeSaved: '312h', accuracy: '94.5%' },
      features: ['Parse PDFs/Word', 'Skill Matching', 'Auto-Ranking', '+1 more'],
      gradient: 'from-blue-600 to-purple-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'interview_coordinator',
      name: 'Interview Coordinator',
      description: 'Smart scheduling & interview automation',
      icon: Calendar,
      status: 'active',
      metrics: { scheduled: 89, conflictsAvoided: 23, satisfaction: '4.8/5' },
      features: ['Calendar Sync', 'Auto-Reminders', 'Panel Coordination', '+1 more'],
      gradient: 'from-indigo-600 to-blue-600',
      bgColor: 'bg-indigo-500/10'
    },
    {
      id: 'onboarding_assistant',
      name: 'Onboarding Assistant',
      description: 'Streamlined employee onboarding workflows',
      icon: Award,
      status: 'active',
      metrics: { onboarded: 34, completion: '98.2%', avgTime: '2 days' },
      features: ['Custom Plans', 'Task Tracking', 'Document Generation', '+1 more'],
      gradient: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'hr_analytics',
      name: 'HR Analytics Engine',
      description: 'Advanced people analytics & insights',
      icon: BarChart3,
      status: 'beta',
      metrics: { reports: 156, insights: 42, predictions: '91.3%' },
      features: ['Turnover Prediction', 'Performance Analytics', 'DEI Metrics', '+1 more'],
      gradient: 'from-pink-600 to-rose-600',
      bgColor: 'bg-pink-500/10'
    }
  ];

  const AgentCard = ({ agent }) => {
    const IconComponent = agent.icon;
    
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          {agent.status === 'active' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Active
            </div>
          )}
          {agent.status === 'beta' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Beta
            </div>
          )}
        </div>
        
        {/* Header */}
        <div className="mb-5">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mb-4`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-1 text-white">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {agent.description}
          </p>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {Object.entries(agent.metrics).map(([key, value], idx) => (
            <div key={idx} className="text-center">
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {agent.features.map((feature, idx) => (
            <span key={idx} className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-gray-800/60 text-gray-300">
              {feature}
            </span>
          ))}
        </div>
        
        {/* Action button */}
        <button 
          className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 text-sm bg-gradient-to-r ${agent.gradient} text-white hover:shadow-md`}
          onClick={() => {
            if (agent.id === 'cv_intelligence') {
              window.location.href = '/cv-intelligence';
            } else {
              window.open(`/agent/${agent.id}`, '_blank');
            }
          }}
        >
          Launch Agent
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Human Resources Dashboard</h1>
                  <p className="text-gray-300">Welcome back, {user?.first_name}!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CVs
                </button>
                <button className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all">
                  <User className="w-4 h-4 mr-2" />
                  Create Custom Agent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Human Resources Agents</h2>
            <p className="text-gray-300">3 active agents, 1 in beta, 0 coming soon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Support Ticket */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Having issues or need assistance with HR processes? Our support team is here to help.
              </p>
              <button 
                onClick={() => window.location.href = '/support/create-ticket'}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Raise Support Ticket
              </button>
            </div>

            {/* Profile Settings */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Profile Settings</h3>
              <p className="text-gray-300 mb-4">
                Update your profile information, change password, and manage account settings.
              </p>
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all">
                <Settings className="w-5 h-5 mr-2" />
                Manage Profile
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">CV Analysis Completed</p>
                    <p className="text-gray-400 text-sm">Batch "Frontend Developers Q1" processed successfully</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Interview Scheduled</p>
                    <p className="text-gray-400 text-sm">3 interviews scheduled for tomorrow</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">4 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Onboarding Completed</p>
                    <p className="text-gray-400 text-sm">2 new employees successfully onboarded</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
