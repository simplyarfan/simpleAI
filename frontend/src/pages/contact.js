import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Head>
        <title>Contact - Nexus AI Platform</title>
        <meta name="description" content="Get in touch with the Nexus team. We're here to help you transform your business with AI." />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 text-gray-900">
        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/">
              <motion.div
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-xl font-bold text-gray-900">Nexus</span>
              </motion.div>
            </Link>

            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
              <span className="text-gray-900 font-semibold">Contact</span>
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

        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                Have questions about our AI agents? Want to discuss enterprise solutions? We're here to help you transform your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/40"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a message</h2>
                
                {isSubmitted ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Tell us about your project and how we can help..."
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </motion.button>
                  </form>
                )}
              </motion.div>

              {/* Contact Info */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Let's start a conversation</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Whether you're looking to implement AI agents in your organization or have questions about our platform, we're here to help.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Us</h3>
                      <p className="text-gray-600">Get in touch via email</p>
                      <a href="mailto:hello@nexus.ai" className="text-orange-600 hover:text-orange-700 font-medium">
                        hello@nexus.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Call Us</h3>
                      <p className="text-gray-600">Mon-Fri from 8am to 5pm</p>
                      <a href="tel:+1-555-123-4567" className="text-orange-600 hover:text-orange-700 font-medium">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Visit Us</h3>
                      <p className="text-gray-600">Come say hello at our office</p>
                      <address className="text-gray-600 not-italic">
                        123 AI Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </address>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Enterprise Solutions</h3>
                  <p className="text-orange-100 mb-6">
                    Looking for custom AI solutions for your enterprise? Our team can help you build tailored AI agents for your specific needs.
                  </p>
                  <Link href="/auth/register">
                    <motion.button 
                      className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Schedule a Demo
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Quick answers to common questions</p>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How quickly can I get started?</h3>
                <p className="text-gray-600">
                  You can get started immediately with our free tier. Simply sign up and you'll have access to our AI agents within minutes.
                </p>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer enterprise support?</h3>
                <p className="text-gray-600">
                  Yes, we provide dedicated enterprise support with SLA guarantees, priority assistance, and custom integration help.
                </p>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What pricing plans do you offer?</h3>
                <p className="text-gray-600">
                  We offer flexible pricing from free tier to enterprise plans. Contact our sales team for custom enterprise pricing.
                </p>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial available?</h3>
                <p className="text-gray-600">
                  Yes, we offer a 14-day free trial with full access to our platform features. No credit card required.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
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
    </>
  );
}
