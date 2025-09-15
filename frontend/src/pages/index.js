import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import RegularDashboard from '../components/RegularDashboard';
import Login from './auth/login';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Check if user is the specific superadmin
  const isSuperAdmin = user?.email === 'syedarfan@securemaxtech.com';

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  return <RegularDashboard />;
};

export default Dashboard;