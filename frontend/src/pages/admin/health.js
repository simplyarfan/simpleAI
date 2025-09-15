import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import { healthAPI } from '../../utils/api';
import { 
  Activity, 
  Server, 
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export default function SystemHealthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [healthData, setHealthData] = useState({
    overall: 'healthy',
    services: [],
    metrics: {}
  });
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
    if (user?.role === 'superadmin') {
      fetchHealthData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchHealthData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockHealthData = {
        overall: 'healthy',
        services: [
          {
            name: 'API Server',
            status: 'healthy',
            responseTime: '45ms',
            uptime: '99.9%',
            lastCheck: new Date().toISOString()
          },
          {
            name: 'Database',
            status: 'healthy',
            responseTime: '12ms',
            uptime: '100%',
            lastCheck: new Date().toISOString()
          },
          {
            name: 'Authentication Service',
            status: 'healthy',
            responseTime: '23ms',
            uptime: '99.8%',
            lastCheck: new Date().toISOString()
          },
          {
            name: 'File Storage',
            status: 'warning',
            responseTime: '156ms',
            uptime: '98.5%',
            lastCheck: new Date().toISOString()
          }
        ],
        metrics: {
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 78,
          networkLatency: 34,
          activeConnections: 127,
          requestsPerMinute: 342
        }
      };
      setHealthData(mockHealthData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricColor = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
              <p className="mt-2 text-gray-600">
                Monitor system performance and health status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <button
                onClick={fetchHealthData}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mb-8">
          <div className={`rounded-lg border-2 p-6 ${getStatusColor(healthData.overall)}`}>
            <div className="flex items-center">
              {getStatusIcon(healthData.overall)}
              <div className="ml-3">
                <h2 className="text-xl font-semibold">
                  System Status: {healthData.overall.charAt(0).toUpperCase() + healthData.overall.slice(1)}
                </h2>
                <p className="text-sm opacity-75">All critical systems are operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(healthData.metrics.cpuUsage)}`}>
                  {healthData.metrics.cpuUsage}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.metrics.cpuUsage >= 90 ? 'bg-red-500' :
                    healthData.metrics.cpuUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${healthData.metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(healthData.metrics.memoryUsage)}`}>
                  {healthData.metrics.memoryUsage}%
                </p>
              </div>
              <MemoryStick className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.metrics.memoryUsage >= 90 ? 'bg-red-500' :
                    healthData.metrics.memoryUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${healthData.metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(healthData.metrics.diskUsage)}`}>
                  {healthData.metrics.diskUsage}%
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    healthData.metrics.diskUsage >= 90 ? 'bg-red-500' :
                    healthData.metrics.diskUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${healthData.metrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Network Latency</p>
                <p className="text-2xl font-bold text-blue-600">{healthData.metrics.networkLatency}ms</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-green-600">{healthData.metrics.activeConnections}</p>
              </div>
              <Server className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requests/Min</p>
                <p className="text-2xl font-bold text-orange-600">{healthData.metrics.requestsPerMinute}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Service Status</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading service status...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {healthData.services.map((service, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-500">
                          Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{service.responseTime}</p>
                        <p className="text-gray-500">Response Time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{service.uptime}</p>
                        <p className="text-gray-500">Uptime</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
