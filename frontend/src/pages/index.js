import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import RegularDashboard from '../components/RegularDashboard';
import Login from './auth/login';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect superadmin users to /superadmin route
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'superadmin') {
      router.push('/superadmin');
    }
  }, [user, loading, isAuthenticated, router]);

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

  // Regular users get the regular dashboard
  return <RegularDashboard />;
};

export default Dashboard;