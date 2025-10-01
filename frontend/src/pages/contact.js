import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';
import StaticDotGrid from '../components/backgrounds/StaticDotGrid';
import GradientText from '../components/text/GradientText';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <>
      <Head>
        <title>Contact - Nexus AI Platform</title>
        <meta name="description" content="Get in touch with Nexus. We're here to help you get started with AI automation." />
      </Head>

      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Static Dot Grid Background */}
        <StaticDotGrid 
          dotSize={1}
          dotColor="#f97316"
          spacing={40}
        />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-xl font-bold">Nexus</span>
              </div>
            </Link>

            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-orange-500 font-semibold">Contact</Link>
            </div>

            <Link href="/auth/login">
              <button className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
                Get Started
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <GradientText 
                  colors={['#ef4444', '#f97316', '#eab308']}
                  className="text-5xl md:text-7xl"
                >
                  Get in Touch
                </GradientText>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      placeholder="Tell us more about your needs..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                  <p className="text-gray-400 mb-8">
                    Choose your preferred way to get in touch with us. We're here to help you succeed with AI.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      icon: Mail,
                      title: "Email",
                      content: "support@nexus.ai",
                      description: "Send us an email anytime",
                      gradient: "from-blue-500 to-indigo-600"
                    },
                    {
                      icon: MessageSquare,
                      title: "Live Chat",
                      content: "Available 24/7",
                      description: "Chat with our support team",
                      gradient: "from-purple-500 to-pink-600"
                    },
                    {
                      icon: Phone,
                      title: "Phone",
                      content: "+1 (555) 123-4567",
                      description: "Mon-Fri from 9am to 6pm",
                      gradient: "from-green-500 to-emerald-600"
                    },
                    {
                      icon: MapPin,
                      title: "Office",
                      content: "San Francisco, CA",
                      description: "123 Innovation Drive",
                      gradient: "from-orange-500 to-red-600"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02, 
                        x: 10,
                        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                      }}
                      className="flex items-start space-x-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-orange-400 font-medium mb-1">{item.content}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/30">
                  <h3 className="text-lg font-bold text-white mb-2">Need immediate help?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Check out our documentation or start a live chat with our support team.
                  </p>
                  <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                      Documentation
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all">
                      Start Chat
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-black border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-lg font-bold">Nexus</span>
              </div>
              <div className="text-sm text-gray-500">© 2025 Nexus. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
