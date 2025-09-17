import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { systemAPI } from '../../utils/api';
import Head from 'next/head';
import Header from '../../components/shared/Header';
import toast from 'react-hot-toast';
import { 
  Activity, 
  Server, 
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Monitor,
  Zap,
  Globe
} from 'lucide-react';

export default function SystemHealth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState({
    overall: 'healthy',
    api: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    memory: 'healthy'
  });
  const [metrics, setMetrics] = useState({
    uptime: '0.0 days',
    responseTime: '0ms',
    apiCalls: 0,
    errorRate: '0%',
    activeUsers: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'superadmin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true);
      
      // Fetch multiple system metrics
      const [healthResponse, metricsResponse] = await Promise.all([
        systemAPI.getHealth(),
        systemAPI.getMetrics()
      ]);
      
      if (healthResponse.data?.success) {
        const healthData = healthResponse.data.data;
        setSystemStatus({
          overall: healthData.overall || 'healthy',
          api: healthData.api || 'healthy',
          database: healthData.database || 'healthy',
          storage: healthData.storage || 'healthy',
          memory: healthData.memory || 'healthy'
        });
      }
      
      if (metricsResponse.data?.success) {
        const metricsData = metricsResponse.data.data;
        setMetrics({
          uptime: metricsData.uptime || '0.0 days',
          responseTime: metricsData.responseTime || '0ms',
          apiCalls: metricsData.apiCalls || 0,
          errorRate: metricsData.errorRate || '0%',
          activeUsers: metricsData.activeUsers || 0,
          cpuUsage: metricsData.cpuUsage || 0,
          memoryUsage: metricsData.memoryUsage || 0,
          diskUsage: metricsData.diskUsage || 0
        });
        
        setRecentEvents(metricsData.recentEvents || []);
      }
      
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Set fallback data for testing
      setSystemStatus({
        overall: 'healthy',
        api: 'healthy',
        database: 'healthy',
        storage: 'healthy',
        memory: 'healthy'
      });
      setMetrics({
        uptime: '0.0 days',
        responseTime: '120ms',
        apiCalls: 15420,
        errorRate: '0.1%',
        activeUsers: 89,
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 34
      });
      setRecentEvents([
        { type: 'success', message: 'System backup completed successfully', time: '5 minutes ago' },
        { type: 'warning', message: 'High memory usage detected (85%)', time: '15 minutes ago' },
        { type: 'info', message: 'Database optimization completed', time: '1 hour ago' }
      ]);
      toast.error('Failed to load system data from API, showing test data');
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const systemComponents = [
    {
      name: 'API Server',
      status: systemStatus.api,
      description: 'Main application server',
      icon: Server,
      metrics: { responseTime: metrics.responseTime, requests: '1.2K/min' }
    },
    {
      name: 'Database',
      status: systemStatus.database,
      description: 'PostgreSQL database',
      icon: Database,
      metrics: { connections: '45/100', queries: '850/min' }
    },
    {
      name: 'Storage',
      status: systemStatus.storage,
      description: 'File storage system',
      icon: HardDrive,
      metrics: { usage: `${metrics.diskUsage}%`, available: '2.1TB' }
    },
    {
      name: 'Memory',
      status: systemStatus.memory,
      description: 'System memory',
      icon: MemoryStick,
      metrics: { usage: `${metrics.memoryUsage}%`, available: '3.2GB' }
    }
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>System Health - Enterprise AI Hub</title>
        <meta name="description" content="Monitor system performance and health status" />
      </Head>
      
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/superadmin')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-purple-600" />
                System Health
              </h1>
              <p className="mt-2 text-gray-600">
                Monitor system performance and health status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button 
                onClick={fetchSystemHealth}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${getStatusColor(systemStatus.overall)}`}>
                {getStatusIcon(systemStatus.overall)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <p className="text-gray-600">
                  {systemStatus.overall === 'healthy' ? 'All systems operational' : 
                   systemStatus.overall === 'warning' ? 'Some issues detected' : 
                   'Critical issues detected'}
                  <Activity className="w-8 h-8 mr-3 text-purple-600" />
                  System Health
                </p>
                <p className="mt-2 text-gray-600">
                  Monitor system performance and health status
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button 
                  onClick={fetchSystemHealth}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getStatusColor(systemStatus.overall)}`}>
                  {getStatusIcon(systemStatus.overall)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                  <p className="text-gray-600">
                    {systemStatus.overall === 'healthy' ? 'All systems operational' : 
                     systemStatus.overall === 'warning' ? 'Some issues detected' : 
                     'Critical issues detected'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metrics.uptime}</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Response Time</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{metrics.responseTime}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">API Calls</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{metrics.apiCalls.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Error Rate</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{metrics.errorRate}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Monitor className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{metrics.activeUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* System Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">System Components</h3>
              
              <div className="space-y-4">
                {systemComponents.map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(component.status)}`}>
                        <component.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{component.name}</div>
                        <div className="text-sm text-gray-500">{component.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                        {getStatusIcon(component.status)}
                        <span className="ml-1 capitalize">{component.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Resource Usage</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">CPU Usage</span>
                    </div>
                    <span className="text-sm text-gray-600">{metrics.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${metrics.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Memory Usage</span>
                    </div>
                    <span className="text-sm text-gray-600">{metrics.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${metrics.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Disk Usage</span>
                    </div>
                    <span className="text-sm text-gray-600">{metrics.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${metrics.diskUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Overall Performance</span>
                  <span className="font-medium text-green-600">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Recent System Events</h3>
            
            <div className="space-y-4">
              {[
                { type: 'info', message: 'System backup completed successfully', time: '5 minutes ago', icon: CheckCircle, color: 'text-green-600' },
                { type: 'warning', message: 'High memory usage detected (85%)', time: '15 minutes ago', icon: AlertTriangle, color: 'text-yellow-600' },
                { type: 'info', message: 'Database optimization completed', time: '1 hour ago', icon: Database, color: 'text-blue-600' },
                { type: 'info', message: 'SSL certificate renewed', time: '2 hours ago', icon: Wifi, color: 'text-green-600' },
                { type: 'error', message: 'Temporary API slowdown resolved', time: '4 hours ago', icon: Server, color: 'text-red-600' }
              ].map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`flex-shrink-0 ${event.color}`}>
                    <event.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
