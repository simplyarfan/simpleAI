import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Brain, Users, BarChart3, FileText, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

export default function Features() {
  return (
    <>
      <Head>
        <title>Features - Nexus AI Agents</title>
        <meta name="description" content="Discover the powerful AI agents that transform your HR, Finance, and Sales departments with intelligent automation." />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 text-gray-900">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mb-8">
              <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-sm font-bold mb-4 uppercase tracking-wider">
                Powerful AI Features
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                AI Agents That Actually
                <br />
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Get Things Done
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-0 max-w-3xl mx-auto">
                Transform your business operations with specialized AI agents designed for HR, Finance, and Sales departments.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* HR Features */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/40">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">HR Department</h3>
                <p className="text-gray-600 mb-6">Revolutionize your hiring and employee management processes.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">CV Intelligence</h4>
                      <p className="text-sm text-gray-600">Analyze hundreds of CVs in seconds, extract key skills, and rank candidates automatically.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Interview Coordinator</h4>
                      <p className="text-sm text-gray-600">Schedule interviews, send reminders, and generate interview questions based on job requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Candidate Matching</h4>
                      <p className="text-sm text-gray-600">Match candidates to job requirements using advanced AI algorithms.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Features */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/40">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Finance Department</h3>
                <p className="text-gray-600 mb-6">Automate financial processes and ensure accuracy at scale.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Invoice Processor</h4>
                      <p className="text-sm text-gray-600">Process invoices instantly, extract data, and integrate with accounting systems.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Expense Auditor</h4>
                      <p className="text-sm text-gray-600">Audit expenses automatically, detect anomalies, and flag potential fraud.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Financial Analytics</h4>
                      <p className="text-sm text-gray-600">Generate insights and reports from financial data automatically.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Features */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/40">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sales & Marketing</h3>
                <p className="text-gray-600 mb-6">Supercharge your sales and marketing efforts with AI.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Lead Generator</h4>
                      <p className="text-sm text-gray-600">Generate qualified leads 24/7 using advanced targeting and outreach.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Campaign Optimizer</h4>
                      <p className="text-sm text-gray-600">Optimize marketing campaigns in real-time for maximum ROI.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Sales Analytics</h4>
                      <p className="text-sm text-gray-600">Track performance, predict trends, and identify opportunities.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Start using AI agents today and see the difference they make.
              </p>
              <Link href="/auth/login">
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2">
                  <span>Try today</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
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
