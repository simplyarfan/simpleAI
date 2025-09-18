import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/shared/Header';
import { supportAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Plus, 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Tag
} from 'lucide-react';

export default function MyTickets() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { value: 'in_progress', label: 'In Progress', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    { value: 'resolved', label: 'Resolved', color: 'text-green-400', bgColor: 'bg-green-500/20' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' }
  ];

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const response = await supportAPI.getMyTickets(params);
      
      if (response.data?.success) {
        setTickets(response.data.data.tickets || []);
      } else {
        toast.error('Failed to load tickets');
      }
    } catch (error) {
      console.error('Fetch tickets error:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, currentPage, statusFilter, priorityFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? `${statusOption.color} ${statusOption.bgColor}` : 'text-gray-400 bg-gray-500/20';
  };

  const getPriorityStyle = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return priorityOption?.color || 'text-gray-400';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <Head>
        <title>My Support Tickets - simpleAI</title>
        <meta name="description" content="View and manage your support tickets" />
      </Head>
      
      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Support Tickets</h1>
                <p className="text-gray-300">View and manage your support requests</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/support/create-ticket')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tickets found</h3>
              <p className="text-gray-300 mb-6">
                {searchTerm ? 'No tickets match your search criteria.' : 'You haven\'t created any support tickets yet.'}
              </p>
              <button
                onClick={() => router.push('/support/create-ticket')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-400">#{ticket.id}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusStyle(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`text-xs font-medium ${getPriorityStyle(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>

                      {/* Subject */}
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-orange-400 transition-colors">
                        {ticket.subject}
                      </h3>

                      {/* Description Preview */}
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {ticket.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {ticket.category.replace('_', ' ')}
                        </div>
                        {ticket.comment_count > 0 && (
                          <div className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {ticket.comment_count} comments
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <button 
                      onClick={() => router.push(`/support/ticket/${ticket.id}`)}
                      className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="View ticket details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
