import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Enhanced floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.15 + 0.05
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  const handleNavigation = (page) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const useCases = [
    {
      title: 'HR Interviews',
      description: 'Get real-time insights and suggested questions during candidate interviews. Never run out of things to ask.',
      examples: ['CV Intelligence analysis', 'Interview coordination', 'Candidate background research'],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Financial Analysis',
      description: 'Instant processing of invoices, expenses, and financial documents with AI-powered insights.',
      examples: ['Invoice processing', 'Expense auditing', 'Financial report analysis'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Sales & Marketing',
      description: 'AI-driven lead generation and campaign optimization to boost your sales performance.',
      examples: ['Lead generation', 'Campaign optimization', 'Sales analytics'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Document Processing',
      description: 'Intelligent document analysis across all departments with real-time insights.',
      examples: ['Contract review', 'Report summarization', 'Data extraction'],
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <Head>
        <title>SimpleAI - Invisible AI That Thinks for Your Business</title>
        <meta name="description" content="AI that understands your business and amplifies human potential across HR, Finance, and Sales departments. Never freeze in a meeting again." />
      </Head>

      <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Floating Particles Canvas */}
        <canvas 
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none opacity-20 z-0"
        />

        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              className="text-2xl font-medium tracking-tight text-gray-900"
              style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              whileHover={{ scale: 1.02 }}
            >
              SimpleAI
            </motion.div>

            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Use Cases</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Enterprise</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Resources</button>
            </div>

            <Link href="/auth/login">
              <motion.button 
                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
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
          <section className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-20">
            <motion.div 
              className="text-center space-y-8 md:space-y-12 max-w-6xl mx-auto px-6 md:px-8"
              style={{ y: y1, opacity }}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="space-y-8"
              >
                <div 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[0.9] tracking-tight text-gray-900"
                  style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  <div>Invisible AI That</div>
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">
                    Thinks for Your Business
                  </div>
                </div>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-600 font-light max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Thinking is the slowest thing you do. Let AI do it for you instead.
                  <br />
                  <span className="text-lg text-gray-500 mt-2 block">
                    AI agents for HR, Finance, and Sales that understand your business and amplify human potential.
                  </span>
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              >
                <Link href="/auth/register">
                  <motion.button 
                    className="px-10 py-4 bg-black text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started Free
                  </motion.button>
                </Link>
                
                <Link href="/auth/login">
                  <motion.button 
                    className="px-10 py-4 bg-gray-100 text-gray-900 text-base font-medium rounded-lg hover:bg-gray-200 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </motion.div>

              {/* Problem Statement Section */}
              <motion.div 
                className="max-w-3xl mx-auto pt-16 md:pt-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  <h3 
                    className="text-xl md:text-2xl font-medium text-gray-900 mb-6 md:mb-8"
                    style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                  >
                    When's the last time you froze in a meeting?
                  </h3>
                  
                  <div className="space-y-4 text-left max-w-2xl mx-auto">
                    {[
                      '"Can you analyze this CV quickly?" [What should I look for?]',
                      '"What\'s our Q4 expense breakdown?" [Let me check...]',
                      '"How are our sales campaigns performing?" [Good question...]'
                    ].map((scenario, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.9 + index * 0.1 }}
                      >
                        <span className="text-gray-400 text-lg">•</span>
                        <span className="text-gray-700 font-medium">
                          {scenario}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.p 
                    className="text-sm text-gray-500 italic pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.3 }}
                  >
                    Suggestion: Scroll down to see SimpleAI in action.
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </section>

          {/* Use Cases Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-8">
              <motion.div 
                className="text-center mb-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 
                  className="text-5xl md:text-6xl font-medium mb-8 leading-tight text-gray-900"
                  style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  Use Cases
                </h2>
                <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                  AI that helps during interviews, financial analysis, sales calls, and everything in between.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {useCases.map((useCase, index) => (
                  <motion.div
                    key={useCase.title}
                    className="group relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-500"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="mb-6">
                      <h3 
                        className={`text-2xl font-semibold bg-gradient-to-r ${useCase.color} bg-clip-text text-transparent mb-4`}
                        style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                      >
                        {useCase.title}
                      </h3>
                      
                      <p className="text-gray-600 font-light leading-relaxed mb-6">
                        {useCase.description}
                      </p>

                      <div className="space-y-2">
                        {useCase.examples.map((example, exampleIndex) => (
                          <div key={exampleIndex} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.color}`}></div>
                            <span className="text-sm text-gray-700 font-medium">
                              {example}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 
                  className="text-6xl md:text-7xl font-thin mb-8 leading-tight text-gray-900"
                  style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  Ready for
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    SimpleAI?
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                  Transform your organization with AI that understands your business.
                </p>

                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl p-10 max-w-md mx-auto mb-12">
                  <div className="space-y-6">
                    <input
                      type="email"
                      placeholder="Work email"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Company name"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    
                    <Link href="/auth/register">
                      <motion.button 
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Start Free Trial →
                      </motion.button>
                    </Link>
                  </div>
                </div>

                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  No credit card required. 14-day free trial.
                </p>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
