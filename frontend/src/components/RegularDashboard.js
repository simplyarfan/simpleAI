import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import { supportAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  BarChart3, 
  PieChart, 
  Activity, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Upload, 
  FileText, 
  Download, 
  Brain, 
  Target, 
  Award, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Home, 
  Building2, 
  UserCheck, 
  FileBarChart, 
  Lightbulb, 
  Shield, 
  Cpu, 
  Database, 
  Code, 
  Globe, 
  Smartphone, 
  Palette, 
  Video, 
  Headphones, 
  Mail, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  Moon, 
  Sun, 
  Sparkles 
} from 'lucide-react';

const RegularDashboard = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('hr');
  const [currentView, setCurrentView] = useState('departments');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cvView, setCvView] = useState('main');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [cvFiles, setCvFiles] = useState([]);
  const [jdFiles, setJdFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [recentBatches, setRecentBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateReport, setShowCandidateReport] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    timeSaved: 0,
    costSaved: 0,
    automationRate: 0
  });

  // Support ticket state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });

  // Memoized batch name change handler
  const handleBatchNameChange = useCallback((e) => {
    const newValue = e.target.value;
    setBatchName(newValue);
  }, []);

  // Handle support ticket creation
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await supportAPI.createTicket({
        ...ticketForm,
        category: 'cv_intelligence'
      });
      toast.success('Support ticket created successfully!');
      setShowTicketModal(false);
      setTicketForm({ subject: '', description: '', priority: 'medium' });
    } catch (error) {
      toast.error('Failed to create support ticket');
    }
  };

  // Handle file uploads and AI processing
  const handleStartAnalysis = async () => {
    if (!batchName || cvFiles.length === 0 || jdFiles.length === 0) return;
    
    setProcessing(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('batchName', batchName);
      
      cvFiles.forEach(file => {
        formData.append('cvFiles', file);
      });
      
      jdFiles.forEach(file => {
        formData.append('jdFile', file);
      });
      
      // For now, simulate the processing since we need to integrate with your backend
      // In production, this would call your CV Intelligence API
      setTimeout(() => {
        const mockResults = {
          batch: {
            id: Date.now(),
            name: batchName,
            created_at: new Date().toISOString(),
            candidate_count: cvFiles.length
          },
          candidates: cvFiles.map((file, index) => ({
            id: `candidate_${index}`,
            name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
            filename: file.name,
            score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
            analysis: {
              skills: ['JavaScript', 'React', 'Node.js', 'Python'].slice(0, Math.floor(Math.random() * 4) + 1),
              experience: ['Frontend Developer', 'Software Engineer'].slice(0, Math.floor(Math.random() * 2) + 1)
            }
          })).sort((a, b) => b.score - a.score)
        };

        setBatchResults(mockResults);
        
        // Add to recent batches
        const newBatch = {
          id: mockResults.batch.id,
          name: mockResults.batch.name,
          status: 'Completed',
          created_at: mockResults.batch.created_at,
          cv_count: mockResults.batch.candidate_count,
          jd_count: jdFiles.length,
          candidates_count: mockResults.candidates.length,
          summary: {
            total_processed: mockResults.candidates.length,
            highly_recommended: mockResults.candidates.filter(c => c.score >= 85).length,
            average_score: Math.round(mockResults.candidates.reduce((sum, c) => sum + c.score, 0) / mockResults.candidates.length)
          }
        };
        setRecentBatches(prev => [newBatch, ...prev]);
        
        // Reset form
        setBatchName('');
        setCvFiles([]);
        setJdFiles([]);
        
        setCvView('results');
        setProcessing(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error processing batch:', error);
      toast.error('Error processing batch. Please try again.');
      setProcessing(false);
    }
  };

  const handleCvFileChange = (e) => {
    setCvFiles(Array.from(e.target.files));
  };

  const handleJdFileChange = (e) => {
    setJdFiles(Array.from(e.target.files));
  };

  const handleCandidateClick = (candidateId) => {
    const candidate = batchResults?.candidates?.find(c => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setShowCandidateReport(true);
    }
  };

  // Load recent batches on component mount
  useEffect(() => {
    // Animated counter effect
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedMetrics({
        timeSaved: Math.floor(1247 * progress),
        costSaved: Math.floor(84500 * progress),
        automationRate: Math.floor(76.3 * progress)
      });
      
      if (currentStep >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const departments = [
    { id: 'hr', name: 'Human Resources', icon: Users, color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-500/10', count: 4 },
    { id: 'finance', name: 'Finance', icon: DollarSign, color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-500/10', count: 3 },
    { id: 'it', name: 'IT Support', icon: Headphones, color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-500/10', count: 2 },
    { id: 'sales', name: 'Sales & Marketing', icon: TrendingUp, color: 'from-orange-500 to-red-600', bgColor: 'bg-orange-500/10', count: 3 },
    { id: 'operations', name: 'Operations', icon: Package, color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-500/10', count: 2 }
  ];

  const agents = {
    hr: [
      {
        id: 'cv_intelligence',
        name: 'CV Intelligence',
        description: 'AI-powered resume parsing, analysis & ranking',
        icon: FileText,
        status: 'active',
        metrics: { processed: 1247, timeSaved: '312h', accuracy: '94.5%' },
        features: ['Parse PDFs/Word', 'Skill Matching', 'Auto-Ranking', 'Bias Detection'],
        gradient: 'from-blue-600 to-purple-600'
      },
      {
        id: 'interview_coordinator',
        name: 'Interview Coordinator',
        description: 'Smart scheduling & interview automation',
        icon: Calendar,
        status: 'active',
        metrics: { scheduled: 89, conflictsAvoided: 23, satisfaction: '4.8/5' },
        features: ['Calendar Sync', 'Auto-Reminders', 'Panel Coordination', 'Prep Kits'],
        gradient: 'from-indigo-600 to-blue-600'
      },
      {
        id: 'onboarding_assistant',
        name: 'Onboarding Assistant',
        description: 'Streamlined employee onboarding workflows',
        icon: Award,
        status: 'active',
        metrics: { onboarded: 34, completion: '98.2%', avgTime: '2 days' },
        features: ['Custom Plans', 'Task Tracking', 'Document Generation', 'Buddy System'],
        gradient: 'from-purple-600 to-pink-600'
      },
      {
        id: 'hr_analytics',
        name: 'HR Analytics Engine',
        description: 'Advanced people analytics & insights',
        icon: BarChart3,
        status: 'beta',
        metrics: { reports: 156, insights: 42, predictions: '91.3%' },
        features: ['Turnover Prediction', 'Performance Analytics', 'DEI Metrics', 'Benchmarking'],
        gradient: 'from-pink-600 to-rose-600'
      }
    ],
    finance: [
      {
        id: 'invoice_processor',
        name: 'Invoice Processor',
        description: 'Automated invoice processing with OCR',
        icon: FileText,
        status: 'coming_soon',
        metrics: {},
        features: ['OCR Scanning', 'GL Coding', 'Approval Workflow', '3-Way Matching'],
        gradient: 'from-emerald-600 to-green-600'
      }
    ],
    it: [
      {
        id: 'helpdesk_ai',
        name: 'Helpdesk AI',
        description: 'Intelligent ticket resolution system',
        icon: Shield,
        status: 'coming_soon',
        metrics: {},
        features: ['Auto-Triage', 'Solution Suggestion', 'Knowledge Base', 'Escalation'],
        gradient: 'from-purple-600 to-indigo-600'
      }
    ],
    sales: [
      {
        id: 'lead_scorer',
        name: 'Lead Scorer',
        description: 'AI-powered lead scoring and qualification',
        icon: Target,
        status: 'coming_soon',
        metrics: {},
        features: ['Lead Scoring', 'Qualification', 'Pipeline Management', 'Forecasting'],
        gradient: 'from-orange-600 to-red-600'
      }
    ],
    operations: [
      {
        id: 'process_optimizer',
        name: 'Process Optimizer',
        description: 'Workflow optimization and automation',
        icon: Zap,
        status: 'coming_soon',
        metrics: {},
        features: ['Process Analysis', 'Automation', 'Optimization', 'Monitoring'],
        gradient: 'from-cyan-600 to-blue-600'
      }
    ]
  };

  const currentAgents = agents[selectedDepartment] || [];
  const currentDept = departments.find(d => d.id === selectedDepartment);

  const AgentCard = ({ agent }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = agent.icon;
    
    return (
      <div
        className={`
          relative group cursor-pointer transform transition-all duration-300 ease-out
          ${isHovered ? 'scale-[1.01] -translate-y-0.5' : 'scale-100'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setSelectedAgent(agent)}
      >
        <div className={`
          relative ${darkMode ? 'bg-gray-900/90' : 'bg-white'}
          rounded-2xl p-6 border
          ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'}
          shadow-lg hover:shadow-xl transition-all duration-300
        `}>
          {/* Status badge */}
          <div className="absolute top-4 right-4">
            {agent.status === 'active' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Active
              </div>
            )}
            {agent.status === 'beta' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Beta
              </div>
            )}
            {agent.status === 'coming_soon' && (
              <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                Coming Soon
              </div>
            )}
          </div>
          
          {/* Header */}
          <div className="mb-5">
            <div className={`
              w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient}
              flex items-center justify-center mb-4
            `}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {agent.name}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
              {agent.description}
            </p>
          </div>
          
          {/* Feature capabilities */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {agent.features.slice(0, 4).map((feature, idx) => (
              <span key={idx} className={`
                text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors
                ${darkMode 
                  ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}>
                {feature}
              </span>
            ))}
            {agent.features.length > 4 && (
              <span className={`
                text-xs px-2.5 py-1.5 rounded-lg font-medium
                ${darkMode ? 'text-gray-500 bg-gray-800/30' : 'text-gray-400 bg-gray-50'}
              `}>
                +{agent.features.length - 4}
              </span>
            )}
          </div>
          
          {/* Action button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (agent.status === 'active') {
                setCurrentPage(agent.id);
              }
            }}
            className={`
              w-full py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
              ${agent.status === 'active' 
                ? `bg-gradient-to-r ${agent.gradient} text-white hover:shadow-md`
                : darkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `} 
            disabled={agent.status !== 'active'}
          >
            {agent.status === 'active' ? 'Launch Agent' : 'Coming Soon'}
          </button>
        </div>
      </div>
    );
  };

  // CV Intelligence Agent Page Component
  const CVIntelligencePage = () => (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header with back button */}
      <header className={`
        px-8 py-6 border-b
        ${darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}
        backdrop-blur-xl
      `}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                CV Intelligence
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-powered resume parsing, analysis & ranking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTicketModal(true)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${darkMode ? 'hover:bg-gray-800 text-gray-300 border border-gray-700' : 'hover:bg-gray-100 text-gray-700 border border-gray-300'}
              `}
            >
              <MessageSquare className="w-4 h-4" />
              Get Help
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {cvView === 'main' && (
            <>
              {/* Create New Batch Section */}
              <div className={`
                p-8 rounded-2xl text-center
                ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'}
              `}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Analysis Batch
                </h2>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-2xl mx-auto`}>
                  Upload CVs and Job Descriptions to start AI-powered candidate analysis and ranking
                </p>
                <button 
                  onClick={() => setCvView('create-batch')}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Start New Batch
                </button>
              </div>

              {/* Recent Analysis Batches */}
              <div className={`
                p-6 rounded-2xl
                ${darkMode ? 'bg-gray-900/50' : 'bg-white'}
                border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
              `}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Analysis Batches
                </h3>
                <div className="space-y-4">
                  {recentBatches.length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No analysis batches yet. Create your first batch to get started!</p>
                    </div>
                  ) : (
                    recentBatches.map((batch) => (
                      <div 
                        key={batch.id}
                        className={`
                          p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                          ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                        `}
                        onClick={() => {
                          setSelectedBatch(batch);
                          setBatchResults({
                            batch: batch,
                            candidates: [] // Would be loaded from API
                          });
                          setCvView('results');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {batch.name}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {batch.cv_count} CVs • {batch.jd_count} JDs • Created {new Date(batch.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {batch.status}
                            </span>
                            <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {cvView === 'create-batch' && (
            <>
              {/* Back to main */}
              <button
                onClick={() => setCvView('main')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors mb-6 ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Main
              </button>

              {/* Batch Creation Form */}
              <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Analysis Batch
                </h2>
                
                {/* Batch Name */}
                <div className="mb-8">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={handleBatchNameChange}
                    placeholder="e.g., Frontend Developer Hiring - Jan 2024"
                    className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {/* Upload Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* CV Upload */}
                  <div className={`p-6 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <h3 className={`text-lg font-semibold mb-2 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Upload CVs/Resumes
                    </h3>
                    <p className={`text-sm text-center mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      PDF, PNG, JPG, JPEG formats supported
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleCvFileChange}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer block text-center">
                      Choose CV Files ({cvFiles.length} selected)
                    </label>
                  </div>

                  {/* JD Upload */}
                  <div className={`p-6 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
                    <FileText className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <h3 className={`text-lg font-semibold mb-2 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Upload Job Descriptions
                    </h3>
                    <p className={`text-sm text-center mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      PDF, PNG, JPG, JPEG formats supported
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleJdFileChange}
                      className="hidden"
                      id="jd-upload"
                    />
                    <label htmlFor="jd-upload" className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer block text-center">
                      Choose JD Files ({jdFiles.length} selected)
                    </label>
                  </div>
                </div>

                {/* Process Button */}
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleStartAnalysis}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
                    disabled={!batchName || cvFiles.length === 0 || jdFiles.length === 0 || processing}
                  >
                    {processing ? 'Processing...' : 'Start AI Analysis'}
                  </button>
                </div>
              </div>
            </>
          )}

          {cvView === 'results' && batchResults && (
            <>
              {/* Back to main */}
              <button
                onClick={() => setCvView('main')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors mb-6 ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Main
              </button>

              {/* Results Header */}
              <div className={`p-6 rounded-2xl mb-8 ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis Results - {batchResults?.batch?.name || 'Batch Results'}
                </h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {batchResults?.candidates?.length || 0} candidates analyzed and ranked by AI
                </p>
              </div>

              {/* Ranked Candidates List */}
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ranked Candidates (Best to Worst)
                </h3>
                <div className="space-y-4">
                  {(batchResults?.candidates || []).map((candidate, index) => (
                    <div 
                      key={candidate?.id || index}
                      className={`
                        p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md
                        ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                      `}
                      onClick={() => handleCandidateClick(candidate?.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              index === 1 ? 'bg-gray-100 text-gray-700' : 
                              index === 2 ? 'bg-orange-100 text-orange-700' : 
                              'bg-blue-100 text-blue-700'}
                          `}>
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {candidate?.name || 'Name not found'}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {candidate?.filename || 'File not found'}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {candidate?.analysis?.skills?.length || 0} skills • {candidate?.analysis?.experience?.length || 0} positions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              candidate?.score >= 80 ? 'text-green-500' : 
                              candidate?.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {candidate?.score || 0}%
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Match Score
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>AI Agent Hub - Enterprise AI Platform</title>
          <meta name="description" content="AI Agent Hub for regular users" />
        </Head>

        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:px-8 sm:py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      AI Agent Hub
                    </h1>
                    <p className="mt-2 text-blue-100 text-lg">
                      Welcome back, {user?.first_name}! Access your AI-powered tools
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

          {currentPage === 'dashboard' && (
            <>
              {/* Department Navigation */}
              <div className="px-4 py-6 sm:px-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search agents, documents, or actions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                      />
                    </div>
                    <div className="relative">
                      <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notifications}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Department Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  {departments.map((dept) => {
                    const IconComponent = dept.icon;
                    return (
                      <div
                        key={dept.id}
                        onClick={() => setSelectedDepartment(dept.id)}
                        className={`
                          relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105
                          ${selectedDepartment === dept.id 
                            ? `bg-gradient-to-br ${dept.color} text-white border-transparent shadow-xl` 
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${selectedDepartment === dept.id 
                              ? 'bg-white bg-opacity-20' 
                              : `${dept.bgColor}`
                            }
                          `}>
                            <IconComponent className={`
                              w-8 h-8 
                              ${selectedDepartment === dept.id 
                                ? 'text-white' 
                                : 'text-gray-700'
                              }
                            `} />
                          </div>
                          <h3 className={`
                            text-lg font-semibold mb-2
                            ${selectedDepartment === dept.id ? 'text-white' : 'text-gray-900'}
                          `}>
                            {dept.name}
                          </h3>
                          <div className={`
                            text-sm px-3 py-1 rounded-full
                            ${selectedDepartment === dept.id 
                              ? 'bg-white bg-opacity-20 text-white' 
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            {dept.count} active agents
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Department Agents */}
              <div className="px-4 py-6 sm:px-0">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentDept?.name} Agents
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {currentAgents.filter(a => a.status === 'active').length} active agents, {currentAgents.filter(a => a.status === 'beta').length} in beta
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentAgents.length} total agents
                  </div>
                </div>

                {/* Agent Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {currentAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            </>
          )}

          {currentPage === 'cv_intelligence' && <CVIntelligencePage />}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default RegularDashboard;
