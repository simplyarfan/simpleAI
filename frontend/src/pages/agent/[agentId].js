import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { cvAPI } from '../../utils/api';
import { 
  Upload, 
  FileText, 
  Brain, 
  ChevronLeft, 
  Plus,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AgentPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { agentId } = router.query;
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      loadAgentData();
    }
  }, [agentId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      // Mock agent data based on agentId
      const agents = {
        cv_intelligence: {
          id: 'cv_intelligence',
          name: 'CV Intelligence',
          description: 'AI-powered resume parsing, analysis & ranking',
          icon: FileText,
          features: ['Parse PDFs/Word', 'Skill Matching', 'Auto-Ranking', 'Bias Detection'],
          status: 'active'
        },
        interview_coordinator: {
          id: 'interview_coordinator',
          name: 'Interview Coordinator',
          description: 'Smart scheduling & interview automation',
          icon: Brain,
          features: ['Calendar Sync', 'Auto-Reminders', 'Panel Coordination', 'Prep Kits'],
          status: 'active'
        }
      };

      const agent = agents[agentId];
      if (agent) {
        setAgentData(agent);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading agent:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Agent Not Found</h2>
          <p className="mt-1 text-gray-600">The requested agent could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <agentData.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agentData.name}</h1>
                <p className="text-gray-600">{agentData.description}</p>
              </div>
            </div>
          </div>

          {/* Agent Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {agentData.id === 'cv_intelligence' ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">CV Intelligence Agent</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Our AI-powered CV analysis tool helps you efficiently process resumes, extract key information, 
                  and rank candidates based on job requirements. Get detailed insights and recommendations 
                  to make better hiring decisions.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Parse PDF and Word documents
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Skills extraction and matching
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Experience analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Bias detection and removal
                      </li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Output Options</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Ranked candidate list
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Detailed analysis reports
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Skills gap identification
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Interview recommendations
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                      <p>Upload CVs and Job Descriptions</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                      <p>AI analyzes and ranks candidates</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                      <p>Get detailed reports and insights</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/cv-intelligence')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-lg"
                >
                  Start CV Analysis
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <agentData.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{agentData.name}</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  {agentData.description}
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-gray-600">
                    This agent is currently in development. Full functionality will be available soon.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {agentData.features.map((feature, idx) => (
                    <span key={idx} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                      {feature}
                    </span>
                  ))}
                </div>

                <button
                  disabled
                  className="px-8 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold text-lg"
                >
                  Coming Soon
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AgentPage;