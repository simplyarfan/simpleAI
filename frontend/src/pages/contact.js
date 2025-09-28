import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          message: ''
        });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(result.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 mb-0 max-w-3xl mx-auto">
                Have questions about our AI agents? Want to discuss enterprise solutions? We're here to help you transform your business.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/40">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a message</h2>
                
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We'll get back to you within 24 hours at syedarfan101@gmail.com</p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
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

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </form>
                  </>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
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
                      <a href="mailto:syedarfan101@gmail.com" className="text-orange-600 hover:text-orange-700 font-medium">
                        syedarfan101@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Call Us</h3>
                      <p className="text-gray-600">Available for support</p>
                      <div className="space-y-1">
                        <a href="tel:+971544257976" className="block text-orange-600 hover:text-orange-700 font-medium">
                          +971 54 425 7976
                        </a>
                        <a href="tel:+966570171269" className="block text-orange-600 hover:text-orange-700 font-medium">
                          +966 57 017 1269
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Enterprise Solutions</h3>
                  <p className="text-orange-100 mb-6">
                    Looking for custom AI solutions for your enterprise? Our team can help you build tailored AI agents for your specific needs.
                  </p>
                  <Link href="/auth/register">
                    <button 
                      className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                      Schedule a Demo
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Quick answers to common questions</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How quickly can I get started?</h3>
                <p className="text-gray-600">
                  You can get started immediately with our free tier. Simply sign up and you'll have access to our AI agents within minutes.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer enterprise support?</h3>
                <p className="text-gray-600">
                  Yes, we provide dedicated enterprise support with SLA guarantees, priority assistance, and custom integration help.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What pricing plans do you offer?</h3>
                <p className="text-gray-600">
                  We offer flexible pricing from free tier to enterprise plans. Contact our sales team for custom enterprise pricing.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial available?</h3>
                <p className="text-gray-600">
                  Yes, we offer a 14-day free trial with full access to our platform features. No credit card required.
                </p>
              </div>
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
