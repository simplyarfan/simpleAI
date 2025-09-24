import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export default function ModernDashboard({ user }) {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    processedToday: 0,
    avgScore: 0,
    activeJobs: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalCandidates: 1247,
        processedToday: 23,
        avgScore: 7.8,
        activeJobs: 12
      });
      
      setRecentActivity([
        { id: 1, type: 'analysis', candidate: 'John Smith', score: 8.5, time: '2 min ago' },
        { id: 2, type: 'interview', candidate: 'Sarah Johnson', status: 'scheduled', time: '15 min ago' },
        { id: 3, type: 'analysis', candidate: 'Mike Chen', score: 6.2, time: '1 hour ago' },
      ]);
    }, 500);
  }, []);

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.totalCandidates.toLocaleString(),
      icon: Users,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Processed Today',
      value: stats.processedToday,
      icon: FileText,
      trend: '+5',
      trendUp: true
    },
    {
      title: 'Average Score',
      value: `${stats.avgScore}/10`,
      icon: TrendingUp,
      trend: '+0.3',
      trendUp: true
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: BarChart3,
      trend: '2 new',
      trendUp: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your CV analysis today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`text-sm font-medium ${
                          stat.trendUp ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.trend}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          from last week
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          {activity.type === 'analysis' ? (
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.candidate}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.type === 'analysis' 
                              ? `CV analyzed - Score: ${activity.score}/10`
                              : `Interview ${activity.status}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                        <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full p-4 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Analyze CV
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload and analyze new CV
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 text-left bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Schedule Interview
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Book candidate interview
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          View Analytics
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Check performance metrics
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
