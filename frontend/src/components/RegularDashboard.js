import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import {
  Brain,
  FileText,
  Users,
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';

const RegularDashboard = () => {
  const { user } = useAuth();

  const agentCards = [
    {
      id: 'cv-intelligence',
      title: 'CV Intelligence',
      description: 'AI-powered resume analysis and candidate ranking',
      icon: FileText,
      href: '/cv-intelligence',
      color: 'from-blue-500 to-purple-600',
      features: ['Batch processing', 'Smart ranking', 'Detailed insights', 'Export results']
    },
    {
      id: 'document-analyzer',
      title: 'Document Analyzer',
      description: 'Intelligent document processing and extraction',
      icon: Brain,
      href: '/document-analyzer',
      color: 'from-green-500 to-teal-600',
      features: ['OCR processing', 'Data extraction', 'Format conversion', 'Batch analysis'],
      comingSoon: true
    },
    {
      id: 'meeting-assistant',
      title: 'Meeting Assistant',
      description: 'AI-powered meeting transcription and summaries',
      icon: Users,
      href: '/meeting-assistant',
      color: 'from-orange-500 to-red-600',
      features: ['Live transcription', 'Action items', 'Meeting summaries', 'Speaker identification'],
      comingSoon: true
    }
  ];

  const quickStats = [
    {
      name: 'AI Agents Available',
      value: agentCards.filter(agent => !agent.comingSoon).length,
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      name: 'Processing Speed',
      value: '10x Faster',
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      name: 'Accuracy Rate',
      value: '99.2%',
      icon: Star,
      color: 'text-green-600'
    },
    {
      name: 'Security Level',
      value: 'Enterprise',
      icon: Shield,
      color: 'text-purple-600'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'cv_batch',
      title: 'CV Batch "Senior Developers" completed',
      description: '15 candidates analyzed and ranked',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'support',
      title: 'Support ticket #1234 updated',
      description: 'Response added to your query',
      time: '4 hours ago',
      status: 'updated'
    },
    {
      id: 3,
      type: 'system',
      title: 'System maintenance completed',
      description: 'All services are running optimally',
      time: '1 day ago',
      status: 'info'
    }
  ];

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Dashboard - Enterprise AI Hub</title>
          <meta name="description" content="AI-powered enterprise solutions dashboard" />
        </Head>

        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:px-8 sm:py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Welcome back, {user?.first_name}!
                    </h1>
                    <p className="mt-2 text-blue-100 text-lg">
                      Ready to supercharge your productivity with AI?
                    </p>
                    <div className="mt-4 flex items-center text-blue-100">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Last login: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                      <Brain className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">AI Agents</h2>
              <span className="text-sm text-gray-500">
                {agentCards.filter(agent => !agent.comingSoon).length} of {agentCards.length} available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentCards.map((agent) => (
                <div
                  key={agent.id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    agent.comingSoon ? 'opacity-75' : 'hover:scale-105'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${agent.color} p-6 text-white relative`}>
                    {agent.comingSoon && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-white bg-opacity-20 text-xs font-medium px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <agent.icon className="w-8 h-8" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold">{agent.title}</h3>
                        <p className="text-sm opacity-90 mt-1">{agent.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <ul className="space-y-2 mb-6">
                      {agent.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {agent.comingSoon ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    ) : (
                      <Link
                        href={agent.href}
                        className="group w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                      >
                        Launch Agent
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <Link href="/activity" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                    View all
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'updated' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Link
                    href="/cv-intelligence"
                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Analyze CVs</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>

                  <Link
                    href="/support"
                    className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">Get Support</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-900">Update Profile</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default RegularDashboard;
