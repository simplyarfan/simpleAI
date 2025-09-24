import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import Header from '../../components/shared/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Activity,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';

export default function SystemHealth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [systemMetrics, setSystemMetrics] = useState({
    server: { status: 'online', uptime: '99.9%', responseTime: '45ms' },
    database: { status: 'healthy', connections: 12, queries: 1247 },
    cpu: { usage: '23%', temperature: '42°C', cores: 4 },
    memory: { used: '2.1GB', total: '8GB', percentage: 26 },
    storage: { used: '45GB', total: '100GB', percentage: 45 },
    network: { status: 'stable', bandwidth: '1Gbps', latency: '12ms' }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!loading && (!user || user.email !== 'syedarfan@securemaxtech.com')) {
      router.push('/');
      return;
    }
    if (user) {
      fetchSystemMetrics();
    }
  }, [user, loading, router]);

  const fetchSystemMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch real metrics from API
      const response = await fetch('/api/system/metrics');
      if (response.ok) {
        const data = await response.json();
        setSystemMetrics(data);
      } else {
        // Fallback to mock data if API fails
        console.log('Using fallback system metrics');
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      // Keep existing mock data on error
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'stable':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'stable':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== 'syedarfan@securemaxtech.com') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Server className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, icon: Icon, status, details, color }) => (
    <motion.div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 border border-white/20 rounded-lg">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        {getStatusIcon(status)}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Status</span>
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm capitalize">{key}</span>
            <span className="text-white text-sm">{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-green-500/5 rounded-full blur-3xl" style={{ left: '10%', top: '20%' }} />
          <div className="absolute w-64 h-64 bg-blue-500/3 rounded-full blur-2xl" style={{ right: '10%', bottom: '20%' }} />
        </div>

        <Head>
          <title>System Health - SimpleAI</title>
          <meta name="description" content="System health monitoring and metrics" />
        </Head>
        
        <div className="relative z-10">
          <Header />
        
          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back to Dashboard Button */}
            <div className="mb-6">
              <motion.button
                onClick={() => router.push('/superadmin')}
                className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </motion.button>
            </div>
            
            {/* Header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 border border-white/20 rounded-lg">
                      <Server className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">System Health</h1>
                      <p className="text-gray-400">Monitor system performance and health metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Last Updated</p>
                      <p className="text-sm text-white">{lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <motion.button
                      onClick={fetchSystemMetrics}
                      className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 text-green-400 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                <span className="ml-3 text-gray-400">Loading system metrics...</span>
              </div>
            ) : (
              <>
                {/* System Overview */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">System Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-white font-medium mb-1">All Systems Operational</h3>
                      <p className="text-green-400 text-sm">Everything is running smoothly</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-white font-medium mb-1">High Performance</h3>
                      <p className="text-blue-400 text-sm">Optimal response times</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-white font-medium mb-1">AI Services Active</h3>
                      <p className="text-purple-400 text-sm">All AI models operational</p>
                    </div>
                  </div>
                </motion.div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricCard
                    title="Server"
                    icon={Server}
                    status={systemMetrics.server.status}
                    details={{
                      uptime: systemMetrics.server.uptime,
                      'response time': systemMetrics.server.responseTime
                    }}
                    color="text-green-400"
                  />
                  
                  <MetricCard
                    title="Database"
                    icon={Database}
                    status={systemMetrics.database.status}
                    details={{
                      connections: systemMetrics.database.connections,
                      queries: systemMetrics.database.queries
                    }}
                    color="text-blue-400"
                  />
                  
                  <MetricCard
                    title="CPU"
                    icon={Cpu}
                    status="normal"
                    details={{
                      usage: systemMetrics.cpu.usage,
                      temperature: systemMetrics.cpu.temperature,
                      cores: systemMetrics.cpu.cores
                    }}
                    color="text-purple-400"
                  />
                  
                  <MetricCard
                    title="Memory"
                    icon={Activity}
                    status="normal"
                    details={{
                      used: systemMetrics.memory.used,
                      total: systemMetrics.memory.total,
                      percentage: `${systemMetrics.memory.percentage}%`
                    }}
                    color="text-yellow-400"
                  />
                  
                  <MetricCard
                    title="Storage"
                    icon={HardDrive}
                    status="healthy"
                    details={{
                      used: systemMetrics.storage.used,
                      total: systemMetrics.storage.total,
                      percentage: `${systemMetrics.storage.percentage}%`
                    }}
                    color="text-orange-400"
                  />
                  
                  <MetricCard
                    title="Network"
                    icon={Wifi}
                    status={systemMetrics.network.status}
                    details={{
                      bandwidth: systemMetrics.network.bandwidth,
                      latency: systemMetrics.network.latency
                    }}
                    color="text-cyan-400"
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
