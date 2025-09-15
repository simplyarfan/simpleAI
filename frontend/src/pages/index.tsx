import React, { useState, useEffect, useRef } from 'react';
import { Upload, Users, Calendar, TrendingUp, Brain, FileText, DollarSign, Headphones, Package, ChevronRight, Search, Bell, Settings, LogOut, Moon, Sun, BarChart3, Clock, CheckCircle, AlertCircle, Star, Activity, Zap, Shield, Award, Target, Sparkles, Bot, Briefcase, CreditCard, HelpCircle, ShoppingCart, Menu, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const EnterpriseAIHub = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('hr');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    timeSaved: 0,
    costSaved: 0,
    automationRate: 0
  });

  // Animated counter effect
  useEffect(() => {
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
        icon: CreditCard,
        status: 'coming_soon',
        metrics: {},
        features: ['OCR Scanning', 'GL Coding', 'Approval Workflow', '3-Way Matching'],
        gradient: 'from-emerald-600 to-green-600'
      },
      {
        id: 'expense_auditor',
        name: 'Expense Auditor',
        description: 'Intelligent expense report validation',
        icon: Shield,
        status: 'coming_soon',
        metrics: {},
        features: ['Policy Checking', 'Receipt Validation', 'Anomaly Detection', 'Auto-Approval'],
        gradient: 'from-green-600 to-teal-600'
      },
      {
        id: 'financial_reporter',
        name: 'Financial Reporter',
        description: 'Natural language financial analysis',
        icon: BarChart3,
        status: 'coming_soon',
        metrics: {},
        features: ['Custom Reports', 'Variance Analysis', 'Forecasting', 'Board Decks'],
        gradient: 'from-teal-600 to-cyan-600'
      }
    ],
    it: [
      {
        id: 'helpdesk_ai',
        name: 'Helpdesk AI',
        description: 'Intelligent ticket resolution system',
        icon: HelpCircle,
        status: 'coming_soon',
        metrics: {},
        features: ['Auto-Triage', 'Solution Suggestion', 'Knowledge Base', 'Escalation'],
        gradient: 'from-purple-600 to-indigo-600'
      },
      {
        id: 'access_manager',
        name: 'Access Manager',
        description: 'Automated access provisioning',
        icon: Shield,
        status: 'coming_soon',
        metrics: {},
        features: ['Role Management', 'Auto-Provisioning', 'Compliance', 'Audit Trail'],
        gradient: 'from-indigo-600 to-purple-600'
      }
    ],
    sales: [
      {
        id: 'lead_qualifier',
        name: 'Lead Qualifier',
        description: 'AI-powered lead scoring & enrichment',
        icon: Target,
        status: 'coming_soon',
        metrics: {},
        features: ['Lead Scoring', 'Data Enrichment', 'Intent Signals', 'Routing'],
        gradient: 'from-orange-600 to-red-600'
      },
      {
        id: 'proposal_generator',
        name: 'Proposal Generator',
        description: 'Automated proposal creation',
        icon: FileText,
        status: 'coming_soon',
        metrics: {},
        features: ['Template Library', 'Pricing Engine', 'E-Signatures', 'Tracking'],
        gradient: 'from-red-600 to-pink-600'
      },
      {
        id: 'campaign_analyzer',
        name: 'Campaign Analyzer',
        description: 'Multi-channel campaign analytics',
        icon: Activity,
        status: 'coming_soon',
        metrics: {},
        features: ['ROI Analysis', 'Attribution', 'A/B Testing', 'Recommendations'],
        gradient: 'from-pink-600 to-orange-600'
      }
    ],
    operations: [
      {
        id: 'inventory_optimizer',
        name: 'Inventory Optimizer',
        description: 'Smart inventory management',
        icon: Package,
        status: 'coming_soon',
        metrics: {},
        features: ['Demand Forecasting', 'Reorder Points', 'Supplier Analytics', 'Waste Reduction'],
        gradient: 'from-cyan-600 to-blue-600'
      },
      {
        id: 'quality_assistant',
        name: 'Quality Assistant',
        description: 'Automated quality control',
        icon: CheckCircle,
        status: 'coming_soon',
        metrics: {},
        features: ['Defect Analysis', 'Root Cause', 'Compliance', 'Reporting'],
        gradient: 'from-blue-600 to-indigo-600'
      }
    ]
  };

  const currentAgents = agents[selectedDepartment as keyof typeof agents] || [];
  const currentDept = departments.find(d => d.id === selectedDepartment);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    // Handle file upload logic here
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files);
  };

  const AgentCard = ({ agent }: { agent: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = agent.icon;
    
    return (
      <div
        className={`
          relative group cursor-pointer transform transition-all duration-500
          ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setSelectedAgent(agent)}
      >
        {/* Glow effect */}
        <div className={`
          absolute -inset-0.5 bg-gradient-to-r ${agent.gradient}
          rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500
        `} />
        
        {/* Card content */}
        <div className={`
          relative ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'}
          backdrop-blur-xl rounded-2xl p-6 border
          ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}
          shadow-2xl
        `}>
          {/* Status badge */}
          <div className="absolute top-4 right-4">
            {agent.status === 'active' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active
              </span>
            )}
            {agent.status === 'beta' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Beta
              </span>
            )}
            {agent.status === 'coming_soon' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-500 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
            )}
          </div>
          
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`
              w-14 h-14 rounded-xl bg-gradient-to-br ${agent.gradient}
              flex items-center justify-center shadow-lg
              transform group-hover:rotate-6 transition-transform duration-500
            `}>
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {agent.name}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {agent.description}
              </p>
            </div>
          </div>
          
          {/* Metrics */}
          {agent.status === 'active' && Object.keys(agent.metrics).length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(agent.metrics).slice(0, 3).map(([key, value]) => (
                <div key={key} className={`
                  text-center p-2 rounded-lg
                  ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}
                `}>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {String(value)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.features.slice(0, 3).map((feature: string, idx: number) => (
              <span key={idx} className={`
                text-xs px-2 py-1 rounded-full
                ${darkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100/50 text-gray-700'}
              `}>
                {feature}
              </span>
            ))}
            {agent.features.length > 3 && (
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${darkMode ? 'text-gray-500' : 'text-gray-400'}
              `}>
                +{agent.features.length - 3} more
              </span>
            )}
          </div>
          
          {/* Action button */}
          <button className={`
            w-full py-2 rounded-lg font-medium transition-all duration-300
            ${agent.status === 'active' 
              ? `bg-gradient-to-r ${agent.gradient} text-white hover:shadow-lg`
              : darkMode 
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `} disabled={agent.status !== 'active'}>
            {agent.status === 'active' ? 'Launch Agent' : 'Coming Soon'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-500`}>
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${currentDept?.color || 'from-blue-500 to-indigo-600'} rounded-full blur-3xl opacity-10 animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br ${currentDept?.color || 'from-blue-500 to-indigo-600'} rounded-full blur-3xl opacity-10 animate-pulse delay-700`} />
      </div>
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full z-40 transition-all duration-500
        ${sidebarOpen ? 'w-72' : 'w-20'}
        ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}
        backdrop-blur-xl border-r
        ${darkMode ? 'border-gray-800' : 'border-gray-200'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Agent Hub
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Enterprise Edition
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Department Navigation */}
        <nav className="p-4">
          <div className={`text-xs font-semibold uppercase mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? 'Departments' : '—'}
          </div>
          {departments.map(dept => {
            const DeptIcon = dept.icon;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl mb-2
                  transition-all duration-300 group relative
                  ${selectedDepartment === dept.id
                    ? `bg-gradient-to-r ${dept.color} text-white shadow-lg`
                    : darkMode
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <DeptIcon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{dept.name}</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${selectedDepartment === dept.id
                        ? 'bg-white/20 text-white'
                        : darkMode
                          ? 'bg-gray-800 text-gray-500'
                          : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {dept.count}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Sidebar Toggle */}
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
      
      {/* Main Content */}
      <main className={`transition-all duration-500 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className={`
          sticky top-0 z-30 px-8 py-4
          ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}
          backdrop-blur-xl border-b
          ${darkMode ? 'border-gray-800' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            {/* Search Bar */}
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
            
            {/* Header Actions */}
            <div className="flex items-center gap-4 ml-8">
              {/* Notifications */}
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
              
              {/* Dark Mode Toggle */}
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
              
              {/* Settings */}
              <button className={`
                p-2 rounded-lg transition-colors
                ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}>
                <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              
              {/* User Profile */}
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
        
        {/* Dashboard Content */}
        <div className="p-8">
          {/* Metrics Cards */}
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
          
          {/* Department Header */}
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
            
            {/* Quick Actions */}
            {selectedDepartment === 'hr' && (
              <div className="flex gap-3">
                <button
                  className={`
                    px-6 py-3 rounded-xl font-medium flex items-center gap-2
                    bg-gradient-to-r ${currentDept?.color} text-white
                    hover:shadow-lg transition-all duration-300
                  `}
                  onDragOver={handleDrag}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-4 h-4" />
                  Upload CVs
                </button>
                <button className={`
                  px-6 py-3 rounded-xl font-medium flex items-center gap-2
                  ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}
                  hover:shadow-lg transition-all duration-300
                `}>
                  <Bot className="w-4 h-4" />
                  Create Custom Agent
                </button>
              </div>
            )}
          </div>
          
          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          
          {/* Drag & Drop Overlay */}
          {dragActive && selectedDepartment === 'hr' && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl p-12 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-bold mb-2">Drop CVs Here</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Release to upload and start analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EnterpriseAIHub;
