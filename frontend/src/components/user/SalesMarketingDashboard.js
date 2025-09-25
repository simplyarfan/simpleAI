import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Target, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  User,
  BarChart3,
  Users,
  Mail,
  Phone,
  Globe,
  Zap,
  Award,
  PieChart,
  Calendar,
  DollarSign,
  Megaphone
} from 'lucide-react';

const SalesMarketingDashboard = () => {
  const { user } = useAuth();

  const agents = [
    {
      id: 'lead_qualifier',
      name: 'Lead Qualifier',
      description: 'AI-powered lead scoring & enrichment',
      icon: Target,
      status: 'coming_soon',
      metrics: { qualified: 0, scored: 0, conversion: '0%' },
      features: ['Lead Scoring', 'Data Enrichment', 'Intent Signals', '+1 more'],
      gradient: 'from-orange-600 to-red-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'proposal_generator',
      name: 'Proposal Generator',
      description: 'Automated proposal creation',
      icon: FileText,
      status: 'coming_soon',
      metrics: { proposals: 0, winRate: '0%', avgValue: '$0' },
      features: ['Template Library', 'Pricing Engine', 'E-Signatures', '+1 more'],
      gradient: 'from-red-600 to-pink-600',
      bgColor: 'bg-red-500/10'
    },
    {
      id: 'campaign_analyzer',
      name: 'Campaign Analyzer',
      description: 'Multi-channel campaign analytics',
      icon: TrendingUp,
      status: 'coming_soon',
      metrics: { campaigns: 0, roi: '0%', reach: '0' },
      features: ['ROI Analysis', 'Attribution', 'A/B Testing', '+1 more'],
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
          <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
            Coming Soon
          </div>
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
              <div className="text-lg font-bold text-gray-400">{value}</div>
              <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {agent.features.map((feature, idx) => (
            <span key={idx} className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-gray-800/30 text-gray-500">
              {feature}
            </span>
          ))}
        </div>
        
        {/* Action button */}
        <button 
          className="w-full py-2.5 rounded-lg font-medium transition-all duration-200 text-sm bg-gray-800 text-gray-500 cursor-not-allowed"
          disabled
        >
          Coming Soon
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

      
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Sales & Marketing Dashboard</h1>
                  <p className="text-gray-300">Welcome back, {user?.first_name}!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all">
                  <Users className="w-4 h-4 mr-2" />
                  Import Leads
                </button>
                <button className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sales & Marketing Agents</h2>
            <p className="text-gray-300">0 active agents, 0 in beta, 3 coming soon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                Having issues or need assistance with sales and marketing processes? Our support team is here to help.
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

        {/* Sales & Marketing Overview */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Sales & Marketing Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Active Leads</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Proposals Sent</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Active Campaigns</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">$0</div>
                <div className="text-sm text-gray-400">Revenue This Month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-500/30 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Sales & Marketing Agents Coming Soon!</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our intelligent sales and marketing automation agents are being developed to help you qualify leads, generate proposals, and analyze campaign performance with AI-powered insights.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-orange-400" />
                Lead Scoring & Qualification
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-orange-400" />
                Automated Proposal Generation
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-orange-400" />
                Campaign Performance Analytics
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesMarketingDashboard;
