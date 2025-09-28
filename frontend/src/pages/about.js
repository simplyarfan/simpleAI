import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Brain, Users, BarChart3, FileText, Sparkles, CheckCircle, ArrowRight, Rocket, Target, Award, TrendingUp } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

export default function About() {
  return (
    <>
      <Head>
        <title>About - Nexus AI Platform</title>
        <meta name="description" content="Learn about Nexus and our mission to democratize AI access for businesses worldwide." />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 text-gray-900">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
                Building the Future of
                <br />
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Artificial Intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-0 max-w-4xl mx-auto">
                We're on a mission to make advanced AI accessible to every business, empowering innovation and driving positive change across industries.
              </p>
            </div>
          </div>
        </section>


        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  We believe artificial intelligence has the power to solve humanity's greatest challenges. Our mission is to democratize access to advanced AI capabilities, making them simple, secure, and affordable for businesses of all sizes.
                </p>
                <p className="text-lg text-gray-600">
                  From startups to Fortune 500 companies, we're empowering organizations to harness the transformative power of AI, driving innovation and creating a better future for everyone.
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-12 text-white text-center">
                <Rocket className="w-16 h-16 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Innovation First</h3>
                <p className="text-orange-100">
                  We push the boundaries of what's possible with AI, constantly exploring new frontiers in machine learning and artificial intelligence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-lg text-gray-600">The principles that guide everything we do</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation First</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We push the boundaries of what's possible with AI, constantly exploring new frontiers in machine learning and artificial intelligence.
                </p>
              </div>

              <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">People-Centric</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Our technology serves humanity. We build AI solutions that augment human capabilities rather than replace them.
                </p>
              </div>

              <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ethical AI</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We're committed to responsible AI development with transparency, fairness, and privacy at the core of everything we do.
                </p>
              </div>

              <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Global Impact</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We believe AI should benefit everyone. Our platform democratizes access to advanced AI capabilities worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
              <p className="text-lg text-gray-600">Key milestones in our mission to democratize AI</p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-orange-500 to-red-600"></div>
              
              <div className="space-y-12">
                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-xl font-bold text-gray-900">Company Founded</h3>
                    <p className="text-gray-600">Started with a vision to democratize AI access for businesses worldwide.</p>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <div className="text-sm font-semibold text-orange-600">2019</div>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <div className="text-sm font-semibold text-orange-600">2020</div>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <h3 className="text-xl font-bold text-gray-900">Series A Funding</h3>
                    <p className="text-gray-600">Raised funding to accelerate product development and team expansion.</p>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-xl font-bold text-gray-900">Global Expansion</h3>
                    <p className="text-gray-600">Launched in 25 countries with localized AI models and support.</p>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <div className="text-sm font-semibold text-orange-600">2021</div>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <div className="text-sm font-semibold text-orange-600">2022</div>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <h3 className="text-xl font-bold text-gray-900">Enterprise Milestone</h3>
                    <p className="text-gray-600">Reached 100+ enterprise clients including Fortune 500 companies.</p>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-xl font-bold text-gray-900">Market Leader</h3>
                    <p className="text-gray-600">Became the leading AI platform with 50,000+ active developers.</p>
                  </div>
                  <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <div className="text-sm font-semibold text-orange-600">2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Join Us on This Journey
              </h2>
              <p className="text-xl text-orange-100 mb-8">
                Be part of the AI revolution and transform your business today.
              </p>
              <Link href="/auth/register">
                <button className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Start Your Free Trial
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
