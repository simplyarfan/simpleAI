import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import { supportAPI } from '../../utils/api';
import Header from '../../components/shared/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  ArrowLeft,
  Calendar,
  Tag,
  Eye,
  MessageCircle,
  X
} from 'lucide-react';

export default function TicketsManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'superadmin' && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await supportAPI.getAllTickets({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter
      });

      if (response.data?.success) {
        setTickets(response.data.data.tickets || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Throw error to trigger error boundary
      throw new Error('Failed to load tickets data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await supportAPI.getStats();
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't set fallback stats, let the API work properly
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'closed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      default:
        return <MessageCircle className="w-3 h-3 mr-1" />;
    }
  };

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowResponseModal(true);
    setResponseText('');
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await supportAPI.addComment(selectedTicket.id, responseText, false);
      
      if (response.data?.success) {
        toast.success('Response sent successfully!');
        setShowResponseModal(false);
        setSelectedTicket(null);
        setResponseText('');
        fetchTickets(); // Refresh tickets
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await supportAPI.updateTicket(ticketId, { status: newStatus });
      
      if (response.data?.success) {
        toast.success('Ticket status updated!');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user.role !== 'superadmin' && user.role !== 'admin') {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        </div>

        <Head>
          <title>Support Tickets - simpleAI</title>
          <meta name="description" content="Manage user support requests and tickets" />
        </Head>
        
        <Header />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push(user.role === 'superadmin' ? '/superadmin' : '/')}
            className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
                <p className="text-gray-300">Manage user support requests and tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Tickets</dt>
                  <dd className="text-lg font-medium text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Open</dt>
                  <dd className="text-lg font-medium text-white">{stats.open}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">In Progress</dt>
                  <dd className="text-lg font-medium text-white">{stats.inProgress}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Closed</dt>
                  <dd className="text-lg font-medium text-white">{stats.closed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="sm:w-48">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-300">
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              #{ticket.id} - {ticket.subject}
                            </div>
                            <div className="text-sm text-gray-300 mt-1 line-clamp-2">
                              {ticket.description?.substring(0, 120)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">
                                {ticket.user_name}
                              </div>
                              <div className="text-sm text-gray-300">
                                {ticket.user_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button 
                              onClick={() => openResponseModal(ticket)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                              title="Respond to ticket"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <select
                              value={ticket.status}
                              onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                              className="text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="open" className="bg-slate-800">Open</option>
                              <option value="in_progress" className="bg-slate-800">In Progress</option>
                              <option value="resolved" className="bg-slate-800">Resolved</option>
                              <option value="closed" className="bg-slate-800">Closed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        {/* Response Modal */}
        {showResponseModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Respond to Ticket #{selectedTicket.id}
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Ticket Info */}
              <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                <h4 className="font-semibold text-white text-lg mb-2">{selectedTicket.subject}</h4>
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">{selectedTicket.description}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <User className="w-4 h-4 mr-2" />
                  <span>From: {selectedTicket.first_name} {selectedTicket.last_name} ({selectedTicket.email})</span>
                </div>
              </div>

              {/* Response Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-3">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Type your response to the user..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResponse}
                  disabled={isSubmitting || !responseText.trim()}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
}
