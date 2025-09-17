import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  Sparkles,
  User
} from 'lucide-react';

const EnterpriseAIHub = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('hr');
  const [currentView, setCurrentView] = useState('departments'); // 'departments' or 'analytics'
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [launchedAgent, setLaunchedAgent] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or agent id
  const [cvView, setCvView] = useState('main'); // 'main', 'create-batch', 'batch-details', 'results'
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

  // Memoized batch name change handler to prevent re-renders
  const handleBatchNameChange = useCallback((e) => {
    const newValue = e.target.value;
    setBatchName(newValue);
  }, []);

  // Handle file uploads and AI processing
  const handleStartAnalysis = async () => {
    if (!batchName || cvFiles.length === 0 || jdFiles.length === 0) return;
    
    setProcessing(true);
    
    try {
      const apiUrl = '/.netlify/functions/cv-intelligence';
      
      console.log('Sending request to:', apiUrl);
      console.log('FormData contents:', {
        batchName: batchName,
        cvFiles_count: cvFiles.length,
        jdFiles_count: jdFiles.length
      });
      
      // Create FormData with correct field names for Netlify function
      const formData = new FormData();
      formData.append('batchName', batchName);
      
      cvFiles.forEach(file => {
        formData.append('cvFiles', file);
      });
      
      jdFiles.forEach(file => {
        formData.append('jdFile', file);
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to process batch');
      }
      
      const result = await response.json();
      
      // Process the result data for display
      const processedResult = {
        batch: result.batch,
        candidates: result.candidates || []
      };
      setBatchResults(processedResult);
      
      // Add to recent batches with proper structure
      const newBatch = {
        id: result.batch.id,
        name: result.batch.name,
        status: 'Completed',
        created_at: result.batch.created_at,
        cv_count: result.batch.candidate_count,
        jd_count: 1,
        candidates_count: result.candidates.length,
        summary: {
          total_processed: result.candidates.length,
          highly_recommended: result.candidates.filter(c => c.score >= 85).length,
          average_score: Math.round(result.candidates.reduce((sum, c) => sum + c.score, 0) / result.candidates.length)
        }
      };
      setRecentBatches(prev => [newBatch, ...prev]);
      
      // Reset form
      setBatchName('');
      setCvFiles([]);
      setJdFiles([]);
      
      setCvView('results');
      
    } catch (error) {
      console.error('Error processing batch:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('Full error details:', error);
      alert(`Error processing batch: ${errorMessage}. Please check console for details.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCvFileChange = (e) => {
    setCvFiles(Array.from(e.target.files));
  };

  const handleJdFileChange = (e) => {
    setJdFiles(Array.from(e.target.files));
  };

  const handleCandidateClick = async (candidateId) => {
    try {
      // Find candidate in current batch results
      const candidate = batchResults?.candidates?.find(c => c.id === candidateId);
      if (candidate) {
        // Get full candidate data from candidatesData via API
        const response = await fetch(`/.netlify/functions/cv-intelligence/candidates/${candidate.batch_id || batchResults.batch.id}`);
        if (response.ok) {
          const candidatesData = await response.json();
          const fullCandidate = candidatesData.find(c => c.id === candidateId);
          if (fullCandidate) {
            setSelectedCandidate(fullCandidate);
            setShowCandidateReport(true);
          } else {
            alert('Candidate details not found.');
          }
        } else {
          // Fallback to basic candidate data
          setSelectedCandidate(candidate);
          setShowCandidateReport(true);
        }
      } else {
        alert('Candidate not found.');
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      alert('Error loading candidate details. Please try again.');
    }
  };

  const downloadCandidateReport = async (batchId) => {
    try {
      const response = await fetch(`/.netlify/functions/cv-intelligence/report/${batchId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CV_Analysis_Report_${batchId}.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate report. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report. Please try again.');
    }
  };

  const handleBatchClick = async (batch) => {
    if (batch.status !== 'Completed') return;
    
    try {
      // Fetch batch results from backend
      const response = await fetch(`/api/cv-intelligence/batch/${batch.id}`);
      if (response.ok) {
        const resultsData = await response.json();
        setBatchResults(resultsData);
        setSelectedBatch(batch);
        setCvView('results');
      } else {
        console.error('Failed to fetch batch results');
        alert('Failed to load batch results. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching batch results:', error);
      alert('Error loading batch results. Please try again.');
    }
  };

  // Load recent batches on component mount and set up animated counter effect
  useEffect(() => {
    // Load recent batches
    const loadRecentBatches = async () => {
      setLoadingBatches(true);
      try {
        const response = await fetch('/.netlify/functions/cv-intelligence');
        if (response.ok) {
          const batches = await response.json();
          setRecentBatches(batches || []);
        } else {
          console.error('Failed to load recent batches');
        }
      } catch (error) {
        console.error('Error loading recent batches:', error);
      } finally {
        setLoadingBatches(false);
      }
    };
    
    loadRecentBatches();
    
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
    ]
  };

  const currentAgents = agents[selectedDepartment] || [];
  const currentDept = departments.find(d => d.id === selectedDepartment);

  const handleDrag = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files);
  };

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
        {/* Simplified card */}
        <div className={`
          relative ${darkMode ? 'bg-gray-900/90' : 'bg-white'}
          rounded-2xl p-6 border
          ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'}
          shadow-lg hover:shadow-xl transition-all duration-300
        `}>
          {/* Status badge - cleaner design */}
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
          
          {/* Header - cleaner layout */}
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
          
          {/* Feature capabilities - show main features as small buttons */}
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
          
          {/* Cleaner action button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (agent.status === 'active') {
                window.open(`/agent/${agent.id}`, '_blank');
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
          </div>
          
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
                    disabled={!batchName || cvFiles.length === 0 || jdFiles.length === 0}
                  >
                    {processing ? 'Processing...' : 'Start AI Analysis'}
                  </button>
                </div>
              </div>
            </>
          )}

          {cvView === 'create-batch' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`
                p-6 rounded-2xl
                ${darkMode ? 'bg-gray-900/50' : 'bg-white'}
                border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
              `}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis Features
                </h3>
                <ul className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Skills extraction and matching
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Experience level assessment
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Education verification
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Bias detection and removal
                  </li>
                </ul>
              </div>
              
              <div className={`
                p-6 rounded-2xl
                ${darkMode ? 'bg-gray-900/50' : 'bg-white'}
                border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
              `}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Output Options
                </h3>
                <ul className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Ranked candidate list
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Detailed analysis report
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Skills gap identification
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Interview recommendations
                  </li>
                </ul>
              </div>
            </div>
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

          {cvView === 'main' && (
            <div className={`
              p-6 rounded-2xl
              ${darkMode ? 'bg-gray-900/50' : 'bg-white'}
              border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
            `}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Analysis Batches
              </h3>
              <div className="space-y-4">
                {loadingBatches ? (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading recent batches...
                  </div>
                ) : recentBatches.length === 0 ? (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No analysis batches yet. Create your first batch to get started!
                  </div>
                ) : (
                  recentBatches.map((batch) => (
                  <div 
                    key={batch.id} 
                    onClick={() => handleBatchClick(batch)}
                    className={`
                      flex items-center justify-between p-5 rounded-xl transition-all cursor-pointer
                      ${darkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-gray-50 hover:bg-gray-100'}
                      ${batch.status === 'Completed' ? 'hover:shadow-md' : 'cursor-default'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${batch.status === 'Completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {batch.status === 'Completed' ? 
                          <CheckCircle className="w-6 h-6 text-green-600" /> : 
                          <Clock className="w-6 h-6 text-blue-600" />
                        }
                      </div>
                      <div>
                        <div className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {batch.name}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {batch.cv_count} CVs • {batch.jd_count} JDs • {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                        {batch.summary && (
                          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Avg Score: {batch.summary.average_score}% • {batch.summary.highly_recommended} Highly Recommended
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        ${batch.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                      `}>
                        {batch.status}
                      </span>
                      {batch.status === 'Completed' && (
                        <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          )}

          {/* Candidate Report Modal */}
          {showCandidateReport && selectedCandidate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Candidate Analysis Report
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => downloadCandidateReport(selectedCandidate.batch_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => setShowCandidateReport(false)}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCandidate?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCandidate?.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCandidate?.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCandidate?.location || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Age</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          N/A
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gender</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          N/A
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Salary</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCandidate?.current_salary || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expected Salary</label>
                        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCandidate?.expected_salary || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Match Analysis */}
                  <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Match Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-center mb-4">
                          <div className={`text-4xl font-bold ${
                            (selectedCandidate.analysis?.match_analysis?.overall_score || 0) >= 80 ? 'text-green-500' : 
                            (selectedCandidate.analysis?.match_analysis?.overall_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {selectedCandidate.analysis?.match_analysis?.overall_score || 0}%
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Match Score</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCandidate.analysis?.match_analysis?.recommendation || 'N/A'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recommendation</p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills Matched</label>
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCandidate.analysis?.match_analysis?.skills_matched?.join(', ') || 'N/A'}
                          </p>
                        </div>
                        <div className="mb-4">
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills Missing</label>
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCandidate.analysis?.match_analysis?.skills_missing?.join(', ') || 'N/A'}
                          </p>
                        </div>
                        <div className="mb-4">
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Strengths</label>
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCandidate.analysis?.match_analysis?.strengths?.join(', ') || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Concerns</label>
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCandidate.analysis?.match_analysis?.concerns?.join(', ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.analysis?.skills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      )) || <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No skills listed</span>}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Experience
                    </h3>
                    <div className="space-y-4">
                      {selectedCandidate.analysis?.experience?.map((exp, index) => (
                        <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {exp.position} at {exp.company}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{exp.duration}</p>
                          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{exp.description}</p>
                        </div>
                      )) || <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No experience listed</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-500`}>
      {currentPage === 'cv_intelligence' ? (
        <CVIntelligencePage />
      ) : (
        <>
          <aside className={`
            fixed left-0 top-0 h-full z-40 transition-all duration-500
            ${sidebarOpen ? 'w-72' : 'w-20'}
            ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}
            backdrop-blur-xl border-r
            ${darkMode ? 'border-gray-800' : 'border-gray-200'}
          `}>
        <div className="p-6 border-b border-gray-200/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  simpleAI
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  AI Platform
                </p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="p-4">
          {/* Dashboard Tab */}
          <button
            onClick={() => setCurrentView('departments')}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl mb-4
              transition-all duration-300 group relative
              ${currentView === 'departments'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : darkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Home className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
            {sidebarOpen && (
              <span className="flex-1 text-left font-medium">Dashboard</span>
            )}
          </button>

          {/* Support Tab */}
          <button
            onClick={() => setCurrentView('support')}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl mb-4
              transition-all duration-300 group relative
              ${currentView === 'support'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : darkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <MessageSquare className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
            {sidebarOpen && (
              <span className="flex-1 text-left font-medium">Support</span>
            )}
          </button>
        </nav>
        
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`
            absolute -right-3 top-24 w-6 h-6 rounded-full
            ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}
            border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            flex items-center justify-center shadow-lg
            hover:scale-110 transition-transform
          `}
        >
          {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </aside>
      
      <main className={`transition-all duration-500 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <header className={`
          sticky top-0 z-30 px-8 py-4
          ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}
          backdrop-blur-xl border-b
          ${darkMode ? 'border-gray-800' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search agents, documents, or actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full pl-12 pr-4 py-3 rounded-xl
                    ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}
                    placeholder-gray-500 focus:outline-none focus:ring-2
                    focus:ring-blue-500 transition-all
                  `}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-8">
              <button className={`
                relative p-2 rounded-lg
                ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                transition-colors
              `}>
                <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                `}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <button className={`
                p-2 rounded-lg transition-colors
                ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}>
                <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200/50">
                <div className="text-right">
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    John Doe
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    HR Manager
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {currentView === 'analytics' ? (
            // Analytics View
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analytics Dashboard
                </h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Comprehensive insights and performance metrics across all departments
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`
                  p-6 rounded-2xl backdrop-blur-xl
                  ${darkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                  border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                  shadow-xl
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {animatedMetrics.timeSaved}h
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Time Saved
                  </div>
                  <div className="mt-2 text-xs text-green-500">
                    +23% from last month
                  </div>
                </div>
                
                <div className={`
                  p-6 rounded-2xl backdrop-blur-xl
                  ${darkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                  border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                  shadow-xl
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${animatedMetrics.costSaved.toLocaleString()}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cost Saved
                  </div>
                  <div className="mt-2 text-xs text-green-500">
                    +18% from last month
                  </div>
                </div>
                
                <div className={`
                  p-6 rounded-2xl backdrop-blur-xl
                  ${darkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                  border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                  shadow-xl
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {animatedMetrics.automationRate}%
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Automation Rate
                  </div>
                  <div className="mt-2 text-xs text-green-500">
                    +5% from last month
                  </div>
                </div>
                
                <div className={`
                  p-6 rounded-2xl backdrop-blur-xl
                  ${darkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                  border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                  shadow-xl
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-purple-500" />
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    4.7/5
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    User Satisfaction
                  </div>
                  <div className="mt-2 text-xs text-red-500">
                    -0.1 from last month
                  </div>
                </div>
              </div>

              {/* Department Usage Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className={`
                  p-6 rounded-2xl backdrop-blur-xl
                  ${darkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                  border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                  shadow-xl
                `}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Department Usage
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'HR', usage: 45, color: 'bg-blue-500' },
                      { name: 'Finance', usage: 28, color: 'bg-green-500' },
                      { name: 'IT', usage: 15, color: 'bg-purple-500' },
                      { name: 'Sales', usage: 12, color: 'bg-orange-500' }
                    ].map(dept => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {dept.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-24 h-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-full rounded-full ${dept.color}`}
                              style={{ width: `${dept.usage}%` }}
                            />
                          </div>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {dept.usage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`
                  p-6 rounded-2xl backdrop-blur-xl
                  ${darkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                  border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                  shadow-xl
                `}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Trending Agents
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'CV Intelligence', increase: 23.5 },
                      { name: 'Interview Coordinator', increase: 18.2 },
                      { name: 'Onboarding Assistant', increase: 12.7 },
                      { name: 'HR Analytics', increase: 8.9 }
                    ].map(agent => (
                      <div key={agent.name} className="flex items-center justify-between">
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {agent.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                          <span className="text-green-500 font-medium">
                            +{agent.increase}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Departments View
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentDept?.name} Agents
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentAgents.filter(a => a.status === 'active').length} active agents, {' '}
                    {currentAgents.filter(a => a.status === 'beta').length} in beta, {' '}
                    {currentAgents.filter(a => a.status === 'coming_soon').length} coming soon
                  </p>
                </div>
                
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
              
            </div>
          )}
        </div>
      </main>
      
      {/* Agent Launch Modal */}
      {launchedAgent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`
            relative max-w-4xl w-full max-h-[90vh] overflow-y-auto
            ${darkMode ? 'bg-gray-900' : 'bg-white'}
            rounded-2xl shadow-2xl
          `}>
            {/* Modal Header */}
            <div className={`
              sticky top-0 z-10 px-6 py-4 border-b
              ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl bg-gradient-to-br ${launchedAgent.gradient}
                    flex items-center justify-center
                  `}>
                    <launchedAgent.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {launchedAgent.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {launchedAgent.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLaunchedAgent(null)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                  `}
                >
                  <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {launchedAgent.id === 'cv_intelligence' && (
                <div className="space-y-6">
                  <div className={`
                    p-4 rounded-xl border-2 border-dashed
                    ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}
                    text-center
                  `}>
                    <Upload className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Upload Resume Files
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      Drop PDF or Word documents here, or click to browse
                    </p>
                    <button className={`
                      px-4 py-2 rounded-lg font-medium text-sm
                      bg-gradient-to-r ${launchedAgent.gradient} text-white
                    `}>
                      Choose Files
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`
                      p-4 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Analysis Features
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li>• Skills extraction and matching</li>
                        <li>• Experience level assessment</li>
                        <li>• Education verification</li>
                        <li>• Bias detection and removal</li>
                      </ul>
                    </div>
                    
                    <div className={`
                      p-4 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Output Options
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li>• Ranked candidate list</li>
                        <li>• Detailed analysis report</li>
                        <li>• Skills gap identification</li>
                        <li>• Interview recommendations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {launchedAgent.id === 'interview_coordinator' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`
                      p-4 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <Calendar className={`w-8 h-8 mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Schedule Interview
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        Automatically coordinate schedules with candidates and interviewers
                      </p>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        bg-gradient-to-r ${launchedAgent.gradient} text-white
                      `}>
                        New Interview
                      </button>
                    </div>
                    
                    <div className={`
                      p-4 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <Bell className={`w-8 h-8 mb-3 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Manage Reminders
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        Set up automated reminders for all participants
                      </p>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                      `}>
                        View Reminders
                      </button>
                    </div>
                  </div>
                  
                  <div className={`
                    p-4 rounded-xl
                    ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                  `}>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Recent Interviews
                    </h4>
                    <div className="space-y-2">
                      {[
                        { candidate: 'John Smith', position: 'Senior Developer', date: '2024-01-15', status: 'Completed' },
                        { candidate: 'Sarah Johnson', position: 'Product Manager', date: '2024-01-16', status: 'Scheduled' },
                        { candidate: 'Mike Chen', position: 'UX Designer', date: '2024-01-17', status: 'Pending' }
                      ].map((interview, idx) => (
                        <div key={idx} className={`
                          flex items-center justify-between p-3 rounded-lg
                          ${darkMode ? 'bg-gray-700/50' : 'bg-white'}
                        `}>
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {interview.candidate}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {interview.position} • {interview.date}
                            </div>
                          </div>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${interview.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'}
                          `}>
                            {interview.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {launchedAgent.id === 'onboarding_assistant' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`
                      p-4 rounded-xl text-center
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <UserPlus className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        New Employee
                      </h4>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        bg-gradient-to-r ${launchedAgent.gradient} text-white
                      `}>
                        Start Onboarding
                      </button>
                    </div>
                    
                    <div className={`
                      p-4 rounded-xl text-center
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <FileText className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Documents
                      </h4>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                      `}>
                        Manage Docs
                      </button>
                    </div>
                    
                    <div className={`
                      p-4 rounded-xl text-center
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <Users className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Buddy System
                      </h4>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                      `}>
                        Assign Buddy
                      </button>
                    </div>
                  </div>
                  
                  <div className={`
                    p-4 rounded-xl
                    ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                  `}>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Onboarding Progress
                    </h4>
                    <div className="space-y-3">
                      {[
                        { task: 'Complete HR paperwork', progress: 100, status: 'completed' },
                        { task: 'IT setup and access', progress: 75, status: 'in-progress' },
                        { task: 'Department orientation', progress: 0, status: 'pending' },
                        { task: 'Buddy introduction', progress: 0, status: 'pending' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.task}
                            </span>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.progress}%
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-full rounded-full ${
                                item.status === 'completed' ? 'bg-green-500' :
                                item.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {launchedAgent.id === 'hr_analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`
                      p-4 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <BarChart3 className={`w-8 h-8 mb-3 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Generate Report
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        Create comprehensive analytics reports
                      </p>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        bg-gradient-to-r ${launchedAgent.gradient} text-white
                      `}>
                        New Report
                      </button>
                    </div>
                    
                    <div className={`
                      p-4 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}>
                      <TrendingUp className={`w-8 h-8 mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Predictive Analytics
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        Forecast turnover and performance trends
                      </p>
                      <button className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                      `}>
                        View Predictions
                      </button>
                    </div>
                  </div>
                  
                  <div className={`
                    p-4 rounded-xl
                    ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
                  `}>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Key Insights (Beta)
                    </h4>
                    <div className="space-y-3">
                      <div className={`
                        p-3 rounded-lg border-l-4 border-yellow-500
                        ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}
                      `}>
                        <div className={`font-medium text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                          Turnover Risk Alert
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          3 employees in Engineering show high turnover probability
                        </div>
                      </div>
                      
                      <div className={`
                        p-3 rounded-lg border-l-4 border-green-500
                        ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}
                      `}>
                        <div className={`font-medium text-sm ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                          Performance Trend
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                          Overall team performance up 12% this quarter
                        </div>
                      </div>
                      
                      <div className={`
                        p-3 rounded-lg border-l-4 border-blue-500
                        ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}
                      `}>
                        <div className={`font-medium text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                          Diversity Metrics
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          Gender diversity improved by 8% in leadership roles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Default view for other agents */}
              {!['cv_intelligence', 'interview_coordinator', 'onboarding_assistant', 'hr_analytics'].includes(launchedAgent.id) && (
                <div className="text-center py-12">
                  <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${launchedAgent.gradient}
                    flex items-center justify-center mx-auto mb-4
                  `}>
                    <launchedAgent.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {launchedAgent.name}
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                    This agent is currently in development. Full functionality will be available soon.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {launchedAgent.features.map((feature, idx) => (
                      <span key={idx} className={`
                        text-xs px-3 py-1.5 rounded-lg font-medium
                        ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}
                      `}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

const RegularDashboard = () => {
  return <EnterpriseAIHub />;
};

export default RegularDashboard;
