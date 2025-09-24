import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { 
  DollarSign, 
  FileText, 
  Calendar, 
  Settings,
  LogOut,
  User,
  ArrowRight,
  Sparkles,
  Zap,
  Receipt,
  Calculator,
  TrendingUp,
  Coins,
  CreditCard,
  PieChart
} from 'lucide-react';

export default function LivelyFinanceDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredAgent, setHoveredAgent] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const financeAgents = [
    {
      id: 'invoice-processor',
      name: 'Invoice Processor',
      description: 'Automated invoice processing and validation',
      route: '/invoice-processor',
      available: false,
      icon: Receipt,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      stats: 'Coming Soon'
    },
    {
      id: 'expense-auditor',
      name: 'Expense Auditor', 
      description: 'AI-powered expense analysis and auditing',
      route: '/expense-auditor',
      available: false,
      icon: Calculator,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      bgGradient: 'from-blue-500/10 to-indigo-500/10',
      stats: 'Coming Soon'
    }
  ];

  const quickActions = [
    {
      title: 'Profile Settings',
      description: 'Manage your account',
      icon: Settings,
      route: '/profile',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Support Tickets',
      description: 'Get help and support',
      icon: FileText,
      route: '/support/create-ticket',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'My Tickets',
      description: 'View ticket history',
      icon: Calendar,
      route: '/support/my-tickets',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ left: '10%', top: '20%' }}
        />
        <motion.div 
          className="absolute w-64 h-64 bg-teal-500/20 rounded-full blur-2xl"
          animate={{
            x: mousePosition.x * -0.01,
            y: mousePosition.y * -0.01,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 15 }}
          style={{ right: '10%', bottom: '20%' }}
        />
        <motion.div 
          className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.015,
            y: mousePosition.y * 0.015,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* SimpleAI Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    SimpleAI
                  </h1>
                  <p className="text-sm text-gray-400">Finance</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.div 
                className="text-sm text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Welcome back, <span className="text-white font-medium">{user?.first_name || 'User'}</span>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white group"
                title="Logout"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-4 py-2 mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Smart Financial Management</span>
            </motion.div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent mb-2">
              Finance AI Agents
            </h2>
            <p className="text-gray-400 text-lg">Automate your financial processes with intelligent AI</p>
          </motion.div>

          {/* Finance Agents */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {financeAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onHoverStart={() => setHoveredAgent(agent.id)}
                  onHoverEnd={() => setHoveredAgent(null)}
                  className={`relative group ${agent.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${agent.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className={`relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 ${agent.available ? 'group-hover:transform group-hover:scale-[1.02]' : 'opacity-75'}`}>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className={`w-16 h-16 bg-gradient-to-r ${agent.gradient} rounded-2xl flex items-center justify-center shadow-lg ${!agent.available ? 'grayscale' : ''}`}
                          whileHover={agent.available ? { rotate: 360 } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          <agent.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                          <p className="text-sm text-gray-400">{agent.stats}</p>
                        </div>
                      </div>
                      {agent.available && (
                        <motion.div
                          animate={{ x: hoveredAgent === agent.id ? 5 : 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">{agent.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${agent.available ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                        <span className={`text-sm font-medium ${agent.available ? 'text-green-400' : 'text-yellow-400'}`}>
                          {agent.available ? 'Available' : 'Coming Soon'}
                        </span>
                      </div>
                      <motion.div 
                        className="flex items-center space-x-1 text-xs text-gray-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <PieChart className="w-3 h-3" />
                        <span>Finance</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  onClick={() => router.push(action.route)}
                  className="relative group bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 text-left overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    <div className={`w-10 h-10 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
