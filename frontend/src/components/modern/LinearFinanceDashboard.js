import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { 
  DollarSign, 
  Shield, 
  BarChart3, 
  FileText, 
  Calculator,
  Receipt,
  Building2,
  CreditCard,
  PieChart,
  TrendingUp,
  Settings, 
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  Plus,
  Upload
} from 'lucide-react';

export default function LinearFinanceDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const agents = [
    {
      id: 'invoice_processor',
      name: 'Invoice Processor',
      description: 'Automated invoice processing with OCR',
      icon: FileText,
      status: 'coming_soon',
      metrics: { pending: 0, processed: 0, accuracy: 'N/A' },
      features: ['OCR Scanning', 'GL Coding', 'Approval Workflow', '+1 more'],
      gradient: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      route: '/finance/invoices'
    },
    {
      id: 'expense_auditor',
      name: 'Expense Auditor',
      description: 'Intelligent expense report validation',
      icon: Shield,
      status: 'coming_soon',
      metrics: { audited: 0, flagged: 0, savings: '$0' },
      features: ['Policy Checking', 'Receipt Validation', 'Anomaly Detection', '+1 more'],
      gradient: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
      route: '/finance/expenses'
    },
    {
      id: 'financial_reporter',
      name: 'Financial Reporter',
      description: 'Automated financial reporting & insights',
      icon: BarChart3,
      status: 'coming_soon',
      metrics: { reports: 0, insights: 0, forecasts: 'N/A' },
      features: ['Auto Reports', 'Trend Analysis', 'Budget Forecasting', '+1 more'],
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      route: '/finance/reports'
    },
    {
      id: 'budget_optimizer',
      name: 'Budget Optimizer',
      description: 'Smart budget allocation & optimization',
      icon: Calculator,
      status: 'coming_soon',
      metrics: { optimized: 0, saved: '$0', efficiency: 'N/A' },
      features: ['Cost Analysis', 'Budget Planning', 'Variance Tracking', '+1 more'],
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      route: '/finance/budget'
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      coming_soon: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    const labels = {
      active: 'Active',
      beta: 'Beta',
      coming_soon: 'Coming Soon'
    };

    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </div>
    );
  };

  const handleAgentClick = (agent) => {
    if (agent.status === 'active' || agent.status === 'beta') {
      router.push(agent.route);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/3 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Finance Dashboard</h1>
                  <p className="text-sm text-gray-400">Welcome back, {user?.first_name || 'Finance'}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Documents</span>
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Custom Agent</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-300">Finance Agents</h2>
              <p className="text-sm text-gray-500">0 active agents, 0 in beta, 4 coming soon</p>
            </div>
          </motion.div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className={`group relative bg-white/5 border ${agent.borderColor} rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer`}
                onClick={() => handleAgentClick(agent)}
                whileHover={{ y: -2 }}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${agent.gradient} rounded-xl flex items-center justify-center`}>
                      <agent.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-400">{agent.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(agent.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{value}</div>
                      <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {agent.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    agent.status === 'active' || agent.status === 'beta'
                      ? `bg-gradient-to-r ${agent.gradient} text-white hover:opacity-90`
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={agent.status === 'coming_soon'}
                >
                  {agent.status === 'coming_soon' ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Coming Soon</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Launch Agent</span>
                    </>
                  )}
                </button>

                {/* Hover Effect */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Finance AI Agents Coming Soon</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                We're building powerful AI agents specifically for finance teams. These tools will automate invoice processing, 
                expense auditing, financial reporting, and budget optimization.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-sm text-gray-500">Expected launch: Q2 2024</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-12"
          >
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-medium">Profile Settings</div>
                    <div className="text-sm text-gray-400">Manage your account</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                </div>
              </button>

              <button
                onClick={() => router.push('/support/my-tickets')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <div>
                    <div className="font-medium">Support Tickets</div>
                    <div className="text-sm text-gray-400">View your tickets</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                </div>
              </button>

              <button
                onClick={() => router.push('/support/create-ticket')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium">Create Ticket</div>
                    <div className="text-sm text-gray-400">Get help or report issues</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
