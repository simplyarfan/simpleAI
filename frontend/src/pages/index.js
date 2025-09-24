import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ModernDashboard from '../components/dashboard/ModernDashboard';
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Check if user is superadmin and redirect
  if (user?.email === 'syedarfan@securemaxtech.com') {
    if (typeof window !== 'undefined' && router.pathname === '/') {
      router.push('/admin');
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white text-sm">Redirecting to admin dashboard...</p>
          </div>
        </div>
      );
    }
  }

  // For all regular users, show the modern CV Intelligence dashboard
  return (
    <DashboardLayout>
      <ModernDashboard user={user} />
    </DashboardLayout>
  );
};

export default Dashboard;