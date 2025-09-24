import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';

export default function ModernCVIntelligence() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    // Simulate loading batches
    setTimeout(() => {
      setBatches([
        {
          id: 1,
          name: 'Senior Developer Batch #1',
          status: 'completed',
          candidatesCount: 15,
          avgScore: 8.2,
          createdAt: '2024-01-15',
          processedAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'Marketing Manager Batch #2',
          status: 'processing',
          candidatesCount: 8,
          avgScore: null,
          createdAt: '2024-01-16',
          processedAt: null
        },
        {
          id: 3,
          name: 'Data Analyst Batch #3',
          status: 'completed',
          candidatesCount: 12,
          avgScore: 7.5,
          createdAt: '2024-01-14',
          processedAt: '2024-01-14'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            CV Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered CV analysis and candidate ranking
          </p>
        </div>
        <Button className="bg-black hover:bg-gray-800 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload CVs
        </Button>
      </div>

      {/* AI Agents Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    CV Analyzer
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Intelligent CV parsing and scoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Interview Coordinator
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automated interview scheduling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Meeting Assistant
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Smart meeting management
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Batches Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Batches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch, index) => (
              <motion.div
                key={batch.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedBatch(batch)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(batch.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {batch.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {batch.candidatesCount} candidates • Created {batch.createdAt}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {batch.avgScore && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {batch.avgScore}/10
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
