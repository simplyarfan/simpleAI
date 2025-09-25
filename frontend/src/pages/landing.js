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
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.85] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-gray-900">Never get caught</span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  unprepared again
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Your secret AI assistant that whispers the right answers during every meeting, interview, and presentation.
              </motion.p>

              <motion.p
                className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto italic"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                "Holy shit, how did you know that?" - Your colleagues, probably
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Remember that time you got completely destroyed?</h3>
                    <div className="space-y-3">
                      {[
                        '"So what\'s your take on the blockchain integration?" [Fuck, what blockchain?]',
                        '"Can you walk us through the Q3 metrics?" [Shit, which metrics again?]',
                        '"What do you think about Sarah\'s proposal?" [Who the hell is Sarah?]'
                      ].map((scenario, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">💀</span>
                          <span className="text-gray-700 font-medium">{scenario}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        <span className="text-green-600">✨ With SimpleAI:</span> You become the person who always has the perfect answer, the right data, and the brilliant insight. Every. Single. Time.
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
                  ⚠️ Unfair Advantage Mode
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                  Stop pretending you know everything.
                  <br />
                  <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    Start actually knowing everything.
                  </span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                  { 
                    title: "Job Interviews", 
                    subtitle: "Never stumble again",
                    description: "Technical questions? Behavioral scenarios? Company history? You'll have every answer before they finish asking.",
                    emoji: "🎯",
                    color: "from-green-400 to-emerald-600"
                  },
                  { 
                    title: "Client Meetings", 
                    subtitle: "Become the expert",
                    description: "Industry insights, competitor analysis, market trends - you'll sound like you've been studying this for years.",
                    emoji: "💼",
                    color: "from-blue-400 to-indigo-600"
                  },
                  { 
                    title: "Sales Calls", 
                    subtitle: "Close every deal",
                    description: "Objection handling, pricing strategies, competitor weaknesses - you'll know exactly what to say.",
                    emoji: "💰",
                    color: "from-purple-400 to-pink-600"
                  },
                  { 
                    title: "Board Meetings", 
                    subtitle: "Command the room",
                    description: "Financial data, strategic insights, industry benchmarks - you'll be the smartest person at the table.",
                    emoji: "👑",
                    color: "from-yellow-400 to-orange-600"
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
                    <div className="text-4xl mb-4">{useCase.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                    <div className={`text-sm font-semibold bg-gradient-to-r ${useCase.color} bg-clip-text text-transparent mb-3`}>
                      {useCase.subtitle}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{useCase.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/auth/register">
                    <button className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-black font-black px-12 py-6 rounded-2xl text-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      🔥 GET YOUR UNFAIR ADVANTAGE
                    </button>
                  </Link>
                </motion.div>
                <p className="text-gray-400 text-sm mt-4">Join 10,000+ professionals who stopped playing fair</p>
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
                  🚨 Last Warning
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                  Your next meeting is in 
                  <br />
                  <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    3 hours.
                  </span>
                </h2>
                <p className="text-xl text-gray-700 mb-8 font-medium">
                  Are you going to wing it again? Or are you finally going to show up prepared?
                </p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-orange-200 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-bold text-red-600 mb-3">😰 Without SimpleAI:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• "Uh, let me get back to you on that..."</li>
                        <li>• Awkward silences when asked for data</li>
                        <li>• Looking unprepared in front of your boss</li>
                        <li>• Missing out on promotions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-600 mb-3">😎 With SimpleAI:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• "Actually, the data shows..."</li>
                        <li>• Instant credibility and respect</li>
                        <li>• Always the smartest person in the room</li>
                        <li>• Fast-track to leadership roles</li>
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
                    🚀 DOWNLOAD NOW - IT'S FREE
                  </motion.button>
                </Link>
                
                <p className="text-sm text-gray-500">
                  ⏰ Setup takes 2 minutes. Your next meeting will never be the same.
                </p>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
