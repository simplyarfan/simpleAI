import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import { 
  ArrowLeft,
  Send,
  Paperclip,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  LifeBuoy,
  Sparkles,
  MessageSquare,
  Tag,
  Zap
} from 'lucide-react';
import { supportAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function LinearCreateTicket() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    category: 'general',
    description: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await supportAPI.createTicket(formData);
      
      if (response.success) {
        toast.success('Support ticket created successfully!');
        router.push('/support/my-tickets');
      } else {
        toast.error(response.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-green-400', bg: 'bg-green-500/20' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { value: 'high', label: 'High Priority', color: 'text-red-400', bg: 'bg-red-500/20' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General Support', icon: LifeBuoy },
    { value: 'technical', label: 'Technical Issue', icon: Zap },
    { value: 'account', label: 'Account Related', icon: MessageSquare },
    { value: 'feature', label: 'Feature Request', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-64 h-64 bg-green-500/3 rounded-full blur-2xl" style={{ right: '10%', bottom: '20%' }} />
      </div>

      <Head>
        <title>Create Support Ticket - SimpleAI</title>
        <meta name="description" content="Create a new support ticket" />
      </Head>

      {/* Header */}
      <motion.header 
        className="relative z-10 border-b border-white/10 bg-black/95 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 text-gray-400 hover:text-white" />
              </motion.button>
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                    <LifeBuoy className="w-5 h-5 text-blue-400" />
                  </div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Create Support Ticket
                  </h1>
                  <p className="text-sm text-gray-400">Get help from our support team</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <motion.div 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Form Header */}
          <div className="p-8 border-b border-white/10 bg-white/5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">New Support Request</h2>
                <p className="text-gray-400">Describe your issue and we'll help you resolve it</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Subject */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Brief description of your issue..."
                required
              />
            </motion.div>

            {/* Priority and Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Priority */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Priority Level
                </label>
                <div className="space-y-3">
                  {priorityOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        formData.priority === option.value
                          ? `${option.bg} border-white/30`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={option.value}
                        checked={formData.priority === option.value}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        formData.priority === option.value ? option.color : 'border-gray-400'
                      } ${formData.priority === option.value ? 'bg-current' : ''}`} />
                      <span className={`font-medium ${
                        formData.priority === option.value ? option.color : 'text-gray-300'
                      }`}>
                        {option.label}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category
                </label>
                <div className="space-y-3">
                  {categoryOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        formData.category === option.value
                          ? 'bg-purple-500/20 border-purple-400/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={option.value}
                        checked={formData.category === option.value}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        formData.category === option.value ? 'bg-purple-500/30' : 'bg-white/10'
                      }`}>
                        <option.icon className={`w-4 h-4 ${
                          formData.category === option.value ? 'text-purple-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <span className={`font-medium ${
                        formData.category === option.value ? 'text-purple-400' : 'text-gray-300'
                      }`}>
                        {option.label}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={8}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Be as specific as possible to help us resolve your issue quickly
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              className="flex justify-end space-x-4 pt-6 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Create Ticket
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Help Section */}
        <motion.div 
          className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tips for Better Support</h3>
              <ul className="text-gray-400 space-y-1 text-sm">
                <li>• Include specific error messages if any</li>
                <li>• Mention your browser and operating system</li>
                <li>• Describe what you were trying to accomplish</li>
                <li>• Include screenshots if helpful</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
