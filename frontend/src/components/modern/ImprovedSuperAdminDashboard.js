import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import { 
  Users, 
  LifeBuoy, 
  BarChart3, 
  Server,
  Settings,
  LogOut,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

export default function ImprovedSuperAdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 15,
    activeTickets: 8,
    systemHealth: 'Excellent',
    uptime: '99.9%'
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminTools = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts, roles and permissions',
      route: '/admin/users',
      icon: Users,
      gradient: 'from-blue-500 to-purple-500',
      bgGradient: 'from-blue-500/10 to-purple-500/10',
      stats: `${stats.totalUsers} users`,
      color: 'text-blue-400'
    },
    {
      id: 'tickets',
      title: 'Support Management',
      description: 'Handle user support requests and tickets',
      route: '/admin/tickets',
      icon: LifeBuoy,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      stats: `${stats.activeTickets} active tickets`,
      color: 'text-green-400'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View platform metrics and user insights',
      route: '/admin/analytics',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      stats: 'Real-time data',
      color: 'text-purple-400'
    },
    {
      id: 'system',
      title: 'System Health',
      description: 'Monitor server performance and system status',
      route: '/admin/system',
      icon: Server,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
      stats: `${stats.uptime} uptime`,
      color: 'text-orange-400'
    }
  ];

  const quickStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20'
    },
    {
      label: 'Active Tickets',
      value: stats.activeTickets,
      icon: LifeBuoy,
      color: 'text-green-400',
      bg: 'bg-green-500/20'
    },
    {
      label: 'System Health',
      value: stats.systemHealth,
      icon: Activity,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20'
    },
    {
      label: 'Uptime',
      value: stats.uptime,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * 0.01,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ left: '10%', top: '20%' }}
        />
        <motion.div 
          className="absolute w-64 h-64 bg-purple-500/3 rounded-full blur-2xl"
          animate={{
            x: mousePosition.x * -0.005,
            y: mousePosition.y * -0.005,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 15 }}
          style={{ right: '10%', bottom: '20%' }}
        />
        <motion.div 
          className="absolute w-80 h-80 bg-green-500/3 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.008,
            y: mousePosition.y * 0.008,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <Head>
        <title>SuperAdmin Dashboard - SimpleAI</title>
        <meta name="description" content="Administrative control panel for SimpleAI platform" />
      </Head>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-white/10 bg-black/95 backdrop-blur-sm"
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
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-2 h-2 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    SimpleAI
                  </h1>
                  <p className="text-sm text-gray-400">SuperAdmin Dashboard</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div 
                className="text-sm text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Welcome back, <span className="text-white font-medium">{user?.first_name || 'Admin'}</span>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white group"
                title="Logout"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-500/30 rounded-full px-6 py-3 mb-6"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Administrative Control Panel</span>
            </motion.div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent mb-4">
              Platform Management
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Monitor, manage, and maintain the SimpleAI platform with comprehensive administrative tools
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <Sparkles className={`w-4 h-4 ${stat.color}`} />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Admin Tools */}
          <div className="mb-12">
            <motion.div 
              className="flex items-center space-x-2 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Administrative Tools</h3>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {adminTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onHoverStart={() => setHoveredCard(tool.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => router.push(tool.route)}
                  className="relative group cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tool.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                  
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <tool.icon className={`w-8 h-8 ${tool.color}`} />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{tool.title}</h3>
                          <p className="text-sm text-gray-400">{tool.stats}</p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ x: hoveredCard === tool.id ? 5 : 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </motion.div>
                    </div>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">{tool.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-green-400 font-medium">Active</span>
                      </div>
                      <motion.div 
                        className="flex items-center space-x-1 text-xs text-gray-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Settings className="w-3 h-3" />
                        <span>Admin Tool</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white">System Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-white font-medium mb-1">All Systems</h4>
                <p className="text-green-400 text-sm">Operational</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Database</h4>
                <p className="text-blue-400 text-sm">Healthy</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Performance</h4>
                <p className="text-purple-400 text-sm">Excellent</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wifi className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Network</h4>
                <p className="text-orange-400 text-sm">Stable</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
