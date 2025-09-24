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
  Upload
} from 'lucide-react';
import { supportAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function LinearCreateTicket() {
  const { user } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    category: 'general',
    description: ''
  });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

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
      const response = await supportAPI.createTicket({
        ...formData,
        user_id: user?.id,
        user_name: user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.email,
        user_email: user?.email
      });

      if (response.success) {
        toast.success('Support ticket created successfully!');
        router.push('/support/my-tickets');
      } else {
        toast.error('Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { value: 'high', label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/20' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General Support' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Account' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' }
  ];

  return (
    <>
      <Head>
        <title>Create Support Ticket - SimpleAI</title>
        <meta name="description" content="Create a new support ticket" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
            }}
          />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-4"
              >
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold">Create Support Ticket</h1>
                  <p className="text-sm text-gray-400">Get help from our support team</p>
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 p-6">
          <div className="max-w-2xl mx-auto">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              {/* Priority and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Priority
                  </label>
                  <div className="space-y-2">
                    {priorityOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={option.value}
                          checked={formData.priority === option.value}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.priority === option.value
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-400'
                        }`}>
                          {formData.priority === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${option.bg} ${option.color}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be as specific as possible to help us resolve your issue quickly
                </p>
              </div>

              {/* File Attachment (placeholder) */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Attachments (optional)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/30 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PNG, JPG, PDF, TXT (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Create Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white mb-2">Before creating a ticket</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Check our FAQ and documentation for common solutions</li>
                    <li>• Provide as much detail as possible about your issue</li>
                    <li>• Include screenshots or error messages if applicable</li>
                    <li>• Our team typically responds within 24 hours</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
