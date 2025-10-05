import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../contexts/AuthContext';
import { supportAPI } from '../../../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  User,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

export default function TicketDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: Clock },
    { value: 'in_progress', label: 'In Progress', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: AlertCircle },
    { value: 'resolved', label: 'Resolved', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' }
  ];

  const fetchTicketDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await supportAPI.getTicket(id);
      
      console.log('Fetch ticket response:', response.data);
      console.log('Comments in response:', response.data?.data?.comments);
      
      if (response.data?.success) {
        const ticketData = response.data.data.ticket;
        const commentsData = response.data.data.comments || [];
        
        console.log('Setting ticket:', ticketData);
        console.log('Setting comments count:', commentsData.length);
        
        setTicket(ticketData);
        setComments(commentsData);
      } else {
        toast.error('Failed to load ticket details');
        router.push('/support/my-tickets');
      }
    } catch (error) {
      console.error('Fetch ticket error:', error);
      toast.error('Failed to load ticket details');
      router.push('/support/my-tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await supportAPI.addComment(id, newComment, false);
      
      console.log('Add comment response:', response.data);
      
      if (response.data?.success) {
        toast.success('Comment added successfully!');
        setNewComment('');
        
        // Add the comment to UI immediately for instant feedback
        const newCommentData = response.data.data?.comment;
        if (newCommentData) {
          console.log('Adding comment to UI immediately:', newCommentData);
          setComments(prevComments => [...prevComments, newCommentData]);
        }
        
        // Also refresh ticket details to ensure consistency
        console.log('Refreshing ticket details for consistency...');
        setTimeout(async () => {
          await fetchTicketDetails();
        }, 500);
      } else {
        toast.error(response.data?.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? `${statusOption.color} ${statusOption.bgColor}` : 'text-gray-400 bg-gray-500/20';
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    const IconComponent = statusOption?.icon || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const getPriorityStyle = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return priorityOption?.color || 'text-gray-400';
  };

  useEffect(() => {
    console.log('useEffect triggered - fetching ticket details for ID:', id);
    fetchTicketDetails();
  }, [id]);
  
  // Add a refresh function that can be called from anywhere
  const refreshTicket = async () => {
    console.log('Manual refresh triggered');
    await fetchTicketDetails();
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-white">Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Ticket Not Found</h3>
            <p className="text-gray-300 mb-6">The ticket you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => {
                const isAdmin = ['admin', 'superadmin'].includes(user?.role);
                router.push(isAdmin ? '/admin/tickets' : '/support/my-tickets');
              }}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              {['admin', 'superadmin'].includes(user?.role) ? 'Back to Support Management' : 'Back to My Tickets'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">

      <Head>
        <title>Ticket #{ticket.id} - {ticket.subject} - simpleAI</title>
        <meta name="description" content={`Support ticket: ${ticket.subject}`} />
      </Head>
      
      
      <main className="relative z-10 max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              const isAdmin = ['admin', 'superadmin'].includes(user?.role);
              router.push(isAdmin ? '/admin/tickets' : '/support/my-tickets');
            }}
            className="flex items-center text-gray-600 hover:text-gray-800 bg-white border border-gray-200 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {['admin', 'superadmin'].includes(user?.role) ? 'Back to Support Management' : 'Back to My Tickets'}
          </button>
        </div>

        {/* Ticket Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-500">#{ticket.id}</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getStatusStyle(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-2 capitalize">{ticket.status.replace('_', ' ')}</span>
                </span>
                <span className={`text-sm font-medium ${getPriorityStyle(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{ticket.subject}</h1>
              <p className="text-gray-600 leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {/* Ticket Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {ticket.category.replace('_', ' ')}
            </div>
            {ticket.updated_at !== ticket.created_at && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Updated {new Date(ticket.updated_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Conversation ({comments.length})
          </h2>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No comments yet. Start the conversation!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {comment.first_name} {comment.last_name}
                          {comment.role === 'admin' && <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Admin</span>}
                          {comment.role === 'superadmin' && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Superadmin</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed ml-11">{comment.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {ticket.status !== 'resolved' && (
            <form onSubmit={handleAddComment} className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Add a comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Type your message..."
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Comment
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {ticket.status === 'resolved' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-700">This ticket has been resolved. If you need further assistance, please create a new ticket.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
