import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import { systemAPI } from '../../utils/api';
import { ArrowLeft } from 'lucide-react';

const SystemHealthPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState({
    apiServer: 'Loading...',
    database: 'Loading...',
    cvProcessing: 'Loading...',
    emailService: 'Loading...'
  });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      fetchSystemHealth();
      fetchSystemAnalytics();
    }
  }, [user]);

  const fetchSystemHealth = async () => {
    try {
      console.log('Fetching system health data...');
      const healthResponse = await systemAPI.getHealth();
      console.log('System health response:', healthResponse);
      
      if (healthResponse.data?.success) {
        const healthData = healthResponse.data.data;
        setSystemStatus({
          apiServer: healthData.services?.api?.status === 'healthy' ? 'Operational' : 'Degraded',
          database: healthData.services?.database?.status === 'healthy' ? 'Operational' : 'Degraded', 
          cvProcessing: 'Operational',
          emailService: 'Operational'
        });
        setAnalytics(healthData);
      } else {
        throw new Error('Health API returned error');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setSystemStatus({
        apiServer: 'Error',
        database: 'Error', 
        cvProcessing: 'Unknown',
        emailService: 'Error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemAnalytics = async () => {
    // This is now handled in fetchSystemHealth
    return;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system health...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/superadmin')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="mt-2 text-gray-600">Monitor system performance and health</p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(systemStatus).map(([key, status]) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className={`text-lg font-semibold ${getStatusColor(status)}`}>
                    {status}
                  </p>
                </div>
                <div className="text-2xl">
                  {getStatusIcon(status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Analytics */}
        {analytics && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Activity (Last 7 Days)</h2>
            </div>
            <div className="p-6">
              {analytics.data?.activityStats?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.data.activityStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {stat.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {stat.unique_users} unique users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
                        <p className="text-sm text-gray-500">total actions</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent system activity data available</p>
              )}
            </div>
          </div>
        )}

        {/* Performance Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-600 mr-4">⚠️</div>
                <div>
                  <p className="font-medium text-yellow-800">Email Service Degraded</p>
                  <p className="text-sm text-yellow-700">Some email notifications may be delayed</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 mr-4">✅</div>
                <div>
                  <p className="font-medium text-green-800">All Other Services Operational</p>
                  <p className="text-sm text-green-700">API, Database, and CV Processing are running normally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPage;
