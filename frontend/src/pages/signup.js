import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Stepper, { Step } from '../components/reactbits/Stepper';
import DotGrid from '../components/backgrounds/DotGrid';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    industry: ''
  });

  return (
    <>
      <Head>
        <title>Sign Up - Nexus AI Platform</title>
      </Head>

      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <DotGrid 
          dotSize={1.5}
          dotColor="#f97316"
          spacing={40}
          glowRadius={200}
          maxGlowSize={6}
        />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg"></div>
                <span className="text-xl font-bold">Nexus</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl font-bold text-center mb-4">
              Create Your <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Account</span>
            </h1>
            <p className="text-gray-400 text-center mb-12">Get started with AI automation in minutes</p>

            <Stepper
              initialStep={1}
              onStepChange={(step) => console.log('Step:', step)}
              onFinalStepCompleted={() => console.log('Registration complete!')}
            >
              <Step>
                <h2 className="text-3xl font-bold mb-6">Welcome! Let's get started</h2>
                <p className="text-gray-400 mb-8">Enter your email to create your account</p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                />
              </Step>

              <Step>
                <h2 className="text-3xl font-bold mb-6">Secure Your Account</h2>
                <p className="text-gray-400 mb-8">Choose a strong password</p>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500 transition-colors mb-4"
                />
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>✓ At least 8 characters</li>
                  <li>✓ One uppercase letter</li>
                  <li>✓ One number or symbol</li>
                </ul>
              </Step>

              <Step>
                <h2 className="text-3xl font-bold mb-6">About Your Company</h2>
                <p className="text-gray-400 mb-8">Help us personalize your experience</p>
                <input
                  type="text"
                  placeholder="Company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500 transition-colors mb-4"
                />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">Select industry</option>
                  <option value="tech">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </Step>

              <Step>
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold mb-4">You're All Set!</h2>
                  <p className="text-gray-400 mb-8">Your account has been created successfully</p>
                  <Link href="/dashboard">
                    <button className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
                      Go to Dashboard
                    </button>
                  </Link>
                </div>
              </Step>
            </Stepper>
          </div>
        </div>
      </div>
    </>
  );
}
