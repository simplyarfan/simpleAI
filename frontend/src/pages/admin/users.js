import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import { authAPI } from '../../utils/api';
import Header from '../../components/shared/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  ArrowLeft,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  X
} from 'lucide-react';

export default function UsersManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    department: '',
    job_title: '',
    role: 'user',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'superadmin') {
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, loading, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getAllUsers({
        page: currentPage,
        search: searchTerm,
        role: filterRole === 'all' ? undefined : filterRole
      });
      
      if (response.data.success) {
        setUsers(response.data.data?.users || []);
        setTotalPages(response.data.data?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Throw error to trigger error boundary
      throw new Error('Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      department: '',
      job_title: '',
      role: 'user'
    });
    setShowPassword(false);
  };

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate email domain
      if (!formData.email.endsWith('@securemaxtech.com')) {
        toast.error('Email must be from @securemaxtech.com domain');
        return;
      }

      const response = await authAPI.createUser(formData);
      
      if (response.data.success) {
        toast.success('User created successfully!');
        setShowAddModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    try {
      setIsSubmitting(true);
      
      const updateData = { ...formData };
      delete updateData.password; // Don't update password in edit
      
      const response = await authAPI.updateUser(selectedUser.id, updateData);
      
      if (response.data.success) {
        toast.success('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await authAPI.deleteUser(selectedUser.id);
      
      if (response.data.success) {
        toast.success('User deleted successfully!');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      password: '',
      first_name: userToEdit.first_name,
      last_name: userToEdit.last_name,
      department: userToEdit.department || '',
      job_title: userToEdit.job_title || '',
      role: userToEdit.role,
      is_active: userToEdit.is_active
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (userToDelete) => {
    setSelectedUser(userToDelete);
    setShowDeleteModal(true);
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchUsers();
    }
  }, [currentPage, searchTerm, filterRole, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <Head>
          <title>User Management - simpleAI</title>
          <meta name="description" content="Manage user accounts, roles and permissions" />
        </Head>
        
        <Header />
        
        <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/superadmin')}
            className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mr-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  User Management
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage user accounts, roles and permissions
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-300">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-300 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'superadmin' 
                            ? 'bg-red-100 text-red-800' 
                            : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.last_login ? (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(user)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 w-96 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add New User</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="user@securemaxtech.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Job Title</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-6 py-3 text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 w-96 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@securemaxtech.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="IT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                className="px-6 py-3 text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>? 
                This action cannot be undone and will remove all user data from the database.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
