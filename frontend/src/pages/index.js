import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import WaitingDashboard from '../components/user/WaitingDashboard';
import HRDashboard from '../components/user/HRDashboard';
import FinanceDashboard from '../components/user/FinanceDashboard';
import SalesMarketingDashboard from '../components/user/SalesMarketingDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import Login from './auth/login';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect superadmin users to /superadmin route
  useEffect(() => {
    if (!loading && isAuthenticated && user?.email === 'syedarfan@securemaxtech.com') {
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

  // If superadmin, show loading while redirecting (prevents flash)
  if (user?.email === 'syedarfan@securemaxtech.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-sm">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Route users based on their department
  if (user?.role === 'user') {
    // If user has no department assigned, show waiting dashboard
    if (!user?.department) {
      return <WaitingDashboard />;
    }

    // Route based on department
    switch (user.department) {
      case 'Human Resources':
        return <HRDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'Sales & Marketing':
        return <SalesMarketingDashboard />;
      default:
        // If department is not recognized, show waiting dashboard
        return <WaitingDashboard />;
    }
  }

  // Admin role gets admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Fallback - show waiting dashboard
  return <WaitingDashboard />;
};

export default Dashboard;