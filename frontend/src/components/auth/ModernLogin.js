import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

export default function ModernLogin({ onLogin, loading = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
        
        {/* Floating elements - very subtle */}
        <motion.div
          className="absolute top-20 left-20 w-2 h-2 bg-gray-300 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-1 h-1 bg-gray-400 rounded-full"
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-gray-300 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">SimpleAI</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Enterprise AI Platform
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Streamline your hiring process with intelligent CV analysis, 
              automated workflows, and data-driven insights.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3" />
                <span>AI-powered CV analysis and ranking</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3" />
                <span>Automated interview coordination</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3" />
                <span>Real-time analytics and insights</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">SimpleAI</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <motion.div
                className={cn(
                  "relative transition-all duration-200",
                  focusedField === 'email' && "transform scale-[1.02]"
                )}
              >
                <input
                  type="email"
                  required
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500",
                    focusedField === 'email' 
                      ? "bg-white border-blue-200 shadow-lg" 
                      : "hover:bg-white hover:border-gray-300"
                  )}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </motion.div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <motion.div
                className={cn(
                  "relative transition-all duration-200",
                  focusedField === 'password' && "transform scale-[1.02]"
                )}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={cn(
                    "w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500",
                    focusedField === 'password' 
                      ? "bg-white border-blue-200 shadow-lg" 
                      : "hover:bg-white hover:border-gray-300"
                  )}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center group"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                Contact your administrator
              </button>
            </p>
          </div>

          {/* Demo credentials hint */}
          <motion.div
            className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-gray-600 text-center">
              <span className="font-medium">Demo:</span> Use any @securemaxtech.com email
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
