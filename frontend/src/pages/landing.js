import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Brain, Users, BarChart3, FileText, Sparkles, Download } from 'lucide-react';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Head>
        <title>SimpleAI - Invisible AI That Thinks for Your Business</title>
        <meta name="description" content="AI that understands your business and amplifies human potential across HR, Finance, and Sales departments. Never freeze in a meeting again." />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900 overflow-hidden">
        {/* Floating 3D Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Floating App Icons */}
          <motion.div
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>

          <motion.div
            className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            className="absolute bottom-40 left-20 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl flex items-center justify-center"
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, 8, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            <BarChart3 className="w-7 h-7 text-white" />
          </motion.div>

          <motion.div
            className="absolute bottom-20 right-10 w-18 h-18 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl flex items-center justify-center"
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <FileText className="w-8 h-8 text-white" />
          </motion.div>

          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">SimpleAI</span>
            </motion.div>

            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Use Cases</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Enterprise</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Resources</button>
            </div>

            <Link href="/auth/login">
              <motion.button 
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started for Free
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
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Invisible AI That Thinks for You</span>
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-medium mb-8 leading-[0.9] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-gray-900">Invisible AI That</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Thinks for You
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                SimpleAI is an undetectable desktop app that gives you the answers you didn't study for in every meeting and conversation.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/auth/register">
                  <motion.button 
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Get for Mac</span>
                  </motion.button>
                </Link>
                
                <Link href="/auth/login">
                  <motion.button 
                    className="flex items-center space-x-2 px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Get for Windows</span>
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
                    <span className="text-sm font-medium text-gray-500">Question: "Why would I even use SimpleAI?"</span>
                  </div>
                  
                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">When's the last time you froze in a meeting?</h3>
                    <div className="space-y-3">
                      {[
                        '"Can you analyze this CV quickly?" [What should I look for?]',
                        '"What\'s our Q4 expense breakdown?" [Let me check...]',
                        '"How are our sales campaigns performing?" [Good question...]'
                      ].map((scenario, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span className="text-gray-700 font-medium">{scenario}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 italic mt-6">
                      Suggestion: Scroll down to see SimpleAI in action.
                    </p>
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
          <section className="py-32 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div 
                className="text-center mb-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  It's time to cheat
                </h2>
                <div className="text-6xl md:text-8xl font-bold leading-tight">
                  <span className="text-gray-900">Interviews.</span>
                  <span className="text-gray-400"> Sales calls.</span>
                  <br />
                  <span className="text-gray-300">Homework.</span>
                  <span className="text-gray-200"> Meetings.</span>
                  <br />
                  <span className="text-gray-100">Really everything.</span>
                </div>
              </motion.div>

              <div className="text-center">
                <Link href="/auth/register">
                  <motion.button 
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 mx-auto"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Get for Mac</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Meeting AI that helps during the call, not after.
                </h2>
                <p className="text-xl text-gray-600 mb-12">
                  Try SimpleAI on your next meeting today.
                </p>

                <Link href="/auth/register">
                  <motion.button 
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 mx-auto"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Get for Mac</span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
