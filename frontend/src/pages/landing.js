import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Brain, Users, BarChart3, FileText, Sparkles, Download, Linkedin, Github } from 'lucide-react';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Head>
        <title>Nexus - AI Agents That Actually Work for Your Business</title>
        <meta name="description" content="Stop hiring expensive consultants. Get specialized AI agents for HR, Finance, and Sales that work 24/7 and never ask for a raise." />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 text-gray-900 overflow-hidden">
        {/* Clean Background - No Floating Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Subtle Gradient Orbs Only */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-r from-yellow-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-bold text-gray-900">Nexus</span>
            </motion.div>

            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
            </div>

            <Link href="/auth/login">
              <motion.button 
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </motion.nav>

        {/* Loading Transition */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="fixed inset-0 bg-white z-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-8"
              >
                <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full px-6 py-3 mb-8 shadow-lg">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-sm transform rotate-45"></div>
                  <span className="text-sm font-medium text-gray-700">AI Agents That Actually Work</span>
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.85] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-gray-900">Stop hiring expensive</span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  consultants
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Get specialized AI agents for HR, Finance, and Sales that work 24/7 and never ask for a raise.
              </motion.p>

              <motion.p
                className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto italic"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                "Wait, you fired the whole consulting team?" - Your CFO, probably
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/auth/register">
                  <motion.button 
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Free Trial
                  </motion.button>
                </Link>
                
                <Link href="/auth/login">
                  <motion.button 
                    className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </motion.div>

              {/* Question Card like Cluely */}
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Question: "Why would I even use Nexus?"</span>
                  </div>
                  
                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tired of waiting weeks for basic tasks?</h3>
                    <div className="space-y-3">
                      {[
                        '"We need CV analysis for 50 candidates" [Weeks of manual work]',
                        '"Can you audit our Q3 expenses?" [Days of spreadsheet hell]',
                        '"Help us optimize our sales funnel" [Months of trial and error]'
                      ].map((scenario, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span className="text-gray-700 font-medium">{scenario}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-700 font-medium">
                        <span className="text-orange-600">With Nexus:</span> Get the same results instantly with our free AI agents. They work 24/7 and never complain.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-32 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div 
                className="text-center mb-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-sm font-semibold mb-4">
                  AI second brain for every meeting
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Thinking is the slowest thing you do.
                  <br />
                  Let AI do it for you instead.
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">Live insights</h3>
                  <p className="text-gray-600">Real-time AI analysis during meetings</p>
                </motion.div>

                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">Instant answers</h3>
                  <p className="text-gray-600">Get answers you didn't study for</p>
                </motion.div>

                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-600 mb-2">Knowledge search</h3>
                  <p className="text-gray-600">Search through all your documents</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-32 bg-black text-white relative overflow-hidden">
            {/* Dark background with subtle pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <motion.div 
                className="text-center mb-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent text-sm font-bold mb-4 uppercase tracking-wider">
                  Unfair Advantage Mode
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                  Stop pretending you know everything.
                  <br />
                  <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    Start actually knowing everything.
                  </span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                  { 
                    title: "HR Department", 
                    subtitle: "CV Intelligence + Interview Coordinator",
                    description: "Analyze 100 CVs in seconds. Find the perfect candidates. Schedule interviews automatically. What used to take weeks now takes minutes.",
                    icon: Users,
                    color: "from-orange-400 to-red-600",
                    benefit: "Instant candidate screening and interview scheduling"
                  },
                  { 
                    title: "Finance Department", 
                    subtitle: "Invoice Processor + Expense Auditor",
                    description: "Process invoices instantly. Audit expenses automatically. Catch fraud before it happens. Your CFO will think you hired a team of 10.",
                    icon: BarChart3,
                    color: "from-red-400 to-pink-600",
                    benefit: "Automated financial processing and fraud detection"
                  },
                  { 
                    title: "Sales & Marketing", 
                    subtitle: "Lead Generator + Campaign Optimizer",
                    description: "Generate qualified leads 24/7. Optimize campaigns in real-time. Turn your marketing budget into a revenue machine.",
                    icon: Brain,
                    color: "from-yellow-400 to-orange-600",
                    benefit: "24/7 lead generation and campaign optimization"
                  }
                ].map((useCase, index) => (
                  <motion.div
                    key={useCase.title}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="mb-4">
                      <useCase.icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                    <div className={`text-sm font-semibold bg-gradient-to-r ${useCase.color} bg-clip-text text-transparent mb-3`}>
                      {useCase.subtitle}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{useCase.description}</p>
                    <div className="text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                      {useCase.benefit}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-lg font-medium">Join 10,000+ professionals who stopped playing fair</p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-32 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-orange-100/50"></div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent text-sm font-bold mb-4 uppercase tracking-wider">
                  Ready to Transform Your Business?
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                  Your departments are waiting for 
                  <br />
                  <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    their AI agents.
                  </span>
                </h2>
                <p className="text-xl text-gray-700 mb-8 font-medium">
                  Stop waiting weeks for work AI can do in minutes.
                </p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-orange-200 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-bold text-red-600 mb-3">Without Nexus:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Hiring external recruiting consultants</li>
                        <li>• Waiting weeks for expense audits</li>
                        <li>• Manual CV screening taking forever</li>
                        <li>• Slow marketing agencies with delayed results</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-600 mb-3">With Nexus:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Free AI agents working 24/7</li>
                        <li>• Instant invoice processing and fraud detection</li>
                        <li>• 100 CVs analyzed in seconds</li>
                        <li>• Lead generation and campaign optimization automated</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Link href="/auth/register">
                  <motion.button 
                    className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white font-black px-16 py-6 rounded-2xl text-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 mb-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    START YOUR FREE TRIAL
                  </motion.button>
                </Link>
                
                <p className="text-sm text-gray-500">
                  Setup takes 5 minutes. Your first AI agent can be working today.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Clean Minimalistic Footer */}
          <footer className="py-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">Nexus</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <Link href="/features" className="hover:text-gray-900 transition-colors">Features</Link>
                  <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
                </div>
                
                <div className="text-sm text-gray-500">
                  © 2025 Nexus. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
