import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { systemAPI } from '../../utils/api';
import Head from 'next/head';
import Header from '../../components/shared/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
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
      // Throw error to trigger error boundary
      throw new Error('Failed to load system health data');
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        </div>

        <Head>
          <title>System Health - simpleAI</title>
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
                    <dd className="text-2xl font-semibold text-gray-900">{metrics.responseTime || 'N/A'}</dd>
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
                    <dd className="text-2xl font-semibold text-gray-900">{metrics.errorRate || 'N/A'}</dd>
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

          {/* System Components and Recent Events */}
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

            {/* Recent Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Recent System Events</h3>
            
            <div className="space-y-4">
              {Array.isArray(recentEvents) && recentEvents.length > 0 ? recentEvents.map((event, index) => {
                const getEventIcon = (type) => {
                  switch (type) {
                    case 'info': return CheckCircle;
                    case 'warning': return AlertTriangle;
                    case 'error': return AlertTriangle;
                    default: return CheckCircle;
                  }
                };
                
                const getEventColor = (type) => {
                  switch (type) {
                    case 'info': return 'text-blue-600';
                    case 'warning': return 'text-yellow-600';
                    case 'error': return 'text-red-600';
                    default: return 'text-gray-600';
                  }
                };
                
                const EventIcon = getEventIcon(event.type);
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className={`flex-shrink-0 ${getEventColor(event.type)}`}>
                      <EventIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{event.message}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.time}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-gray-500 py-8">
                  No recent system events
                </div>
              )}
            </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
