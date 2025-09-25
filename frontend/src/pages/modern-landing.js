import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';

const ModernLanding = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning algorithms that understand context and nuance",
      gradient: "from-blue-500 to-cyan-400",
      delay: 0.1
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Process thousands of documents in seconds with real-time analysis",
      gradient: "from-purple-500 to-pink-400", 
      delay: 0.2
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      description: "Bank-grade encryption with SOC2 compliance and zero data retention",
      gradient: "from-green-500 to-emerald-400",
      delay: 0.3
    },
    {
      icon: "📈",
      title: "Smart Analytics",
      description: "Deep insights with predictive analytics and custom reporting",
      gradient: "from-orange-500 to-red-400",
      delay: 0.4
    }
  ];

  const departments = [
    {
      title: "Human Resources",
      description: "Transform recruitment with AI-powered CV screening and candidate matching",
      icon: "👥",
      stats: "95% accuracy",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      title: "Finance",
      description: "Automate invoice processing and financial document analysis",
      icon: "💼", 
      stats: "80% time saved",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconBg: "bg-green-500"
    },
    {
      title: "Sales & Marketing",
      description: "Optimize campaigns with intelligent lead scoring and content analysis",
      icon: "🚀",
      stats: "3x conversion rate",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconBg: "bg-purple-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "HR Director at TechCorp",
      content: "SimpleAI reduced our hiring time by 70%. The CV analysis is incredibly accurate.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez", 
      role: "CFO at StartupXYZ",
      content: "Our invoice processing is now fully automated. It's like having a team of AI analysts.",
      avatar: "MR"
    },
    {
      name: "Emily Johnson",
      role: "Marketing Lead at GrowthCo",
      content: "The insights we get from SimpleAI have transformed our campaign performance completely.",
      avatar: "EJ"
    }
  ];

  return (
    <>
      <Head>
        <title>SimpleAI - Transform Every Department with AI</title>
        <meta name="description" content="Supercharge your organization with specialized AI agents for HR, Finance, and Sales. Automate workflows and accelerate growth." />
      </Head>
      
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-100/30 to-purple-100/30 blur-3xl"
            style={{
              x: mousePosition.x,
              y: mousePosition.y,
              left: '20%',
              top: '10%'
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-100/20 to-orange-100/20 blur-3xl"
            style={{
              x: -mousePosition.x,
              y: -mousePosition.y, 
              right: '20%',
              bottom: '10%'
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Navigation */}
        <motion.nav 
          className="relative z-50 px-6 py-4 backdrop-blur-sm bg-white/80"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                SimpleAI
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Departments', 'Pricing', 'About'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                </motion.a>
              ))}
              <Link href="/auth/register">
                <motion.button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="relative z-10 px-6 pt-20 pb-32">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Powered by Advanced AI</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Every Department
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Supercharge your organization with specialized AI agents for HR, Finance, and Sales. 
              Automate complex workflows, gain instant insights, and accelerate growth like never before.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Link href="/auth/register">
                <motion.button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial →
                </motion.button>
              </Link>
              <motion.button 
                className="flex items-center space-x-2 text-gray-700 font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </div>
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            {/* Floating Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { number: '500k+', label: 'Documents Processed' },
                { number: '95%', label: 'Accuracy Rate' },
                { number: '3x', label: 'Faster Processing' },
                { number: '24/7', label: 'AI Support' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 px-6 py-32 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to revolutionize your business processes with cutting-edge AI technology.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId={`feature-bg-${index}`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section id="departments" className="relative z-10 px-6 py-32">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-6">
                AI for Every Department
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Specialized AI agents tailored to meet the unique challenges and opportunities of each department.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {departments.map((dept, index) => (
                <motion.div
                  key={dept.title}
                  className={`group relative border-2 rounded-3xl p-8 transition-all duration-500 cursor-pointer ${dept.color}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className={`w-16 h-16 ${dept.iconBg} rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {dept.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{dept.title}</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{dept.description}</p>
                  <div className="inline-flex items-center space-x-2 bg-white/60 border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{dept.stats}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 px-6 py-32 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Loved by Teams Worldwide
            </motion.h2>

            <div className="relative h-64">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 max-w-2xl mx-auto shadow-xl">
                    <p className="text-xl text-gray-700 leading-relaxed mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonials[currentTestimonial].avatar}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {testimonials[currentTestimonial].role}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-6 py-32 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
                Join thousands of companies already using SimpleAI to revolutionize their operations and accelerate growth.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/auth/register">
                  <motion.button 
                    className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Free Trial
                  </motion.button>
                </Link>
                <motion.button 
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  Schedule Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 px-6 py-12 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-xl font-bold">SimpleAI</span>
              </div>
              
              <div className="flex items-center space-x-8">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
              </div>
              
              <div className="text-gray-400 text-sm">
                © 2024 SimpleAI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ModernLanding;