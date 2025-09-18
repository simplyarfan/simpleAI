import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../shared/Header';
import { 
  FileText, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  User,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  PieChart,
  Calculator,
  Receipt,
  Building2
} from 'lucide-react';

const FinanceDashboard = () => {
  const { user } = useAuth();

  const agents = [
    {
      id: 'invoice_processor',
      name: 'Invoice Processor',
      description: 'Automated invoice processing with OCR',
      icon: FileText,
      status: 'coming_soon',
      metrics: { pending: 0, processed: 0, accuracy: 'N/A' },
      features: ['OCR Scanning', 'GL Coding', 'Approval Workflow', '+1 more'],
      gradient: 'from-emerald-600 to-green-600',
      bgColor: 'bg-emerald-500/10'
    },
    {
      id: 'expense_auditor',
      name: 'Expense Auditor',
      description: 'Intelligent expense report validation',
      icon: Shield,
      status: 'coming_soon',
      metrics: { audited: 0, flagged: 0, savings: '$0' },
      features: ['Policy Checking', 'Receipt Validation', 'Anomaly Detection', '+1 more'],
      gradient: 'from-teal-600 to-cyan-600',
      bgColor: 'bg-teal-500/10'
    },
    {
      id: 'financial_reporter',
      name: 'Financial Reporter',
      description: 'Natural language financial analysis',
      icon: BarChart3,
      status: 'coming_soon',
      metrics: { reports: 0, insights: 0, forecasts: 'N/A' },
      features: ['Custom Reports', 'Variance Analysis', 'Forecasting', '+1 more'],
      gradient: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-500/10'
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

      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
                  <p className="text-gray-300">Welcome back, {user?.first_name}!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all">
                  <Receipt className="w-4 h-4 mr-2" />
                  Upload Invoices
                </button>
                <button className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all">
                  <Calculator className="w-4 h-4 mr-2" />
                  Financial Calculator
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Finance Agents</h2>
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
                Having issues or need assistance with financial processes? Our support team is here to help.
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

        {/* Financial Overview */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Financial Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">$0</div>
                <div className="text-sm text-gray-400">Pending Invoices</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">$0</div>
                <div className="text-sm text-gray-400">Processed This Month</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Flagged Expenses</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">0%</div>
                <div className="text-sm text-gray-400">Cost Savings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/30 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Finance Agents Coming Soon!</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our powerful finance automation agents are currently in development. Soon you'll be able to automate invoice processing, expense auditing, and financial reporting with AI-powered precision.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                OCR Invoice Processing
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                Expense Policy Validation
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                Financial Analytics
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinanceDashboard;
