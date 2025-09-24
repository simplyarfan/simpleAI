import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import WaitingDashboard from '../components/user/WaitingDashboard';
import LinearHRDashboard from '../components/modern/LinearHRDashboard';
import LinearFinanceDashboard from '../components/modern/LinearFinanceDashboard';
import LinearSalesDashboard from '../components/modern/LinearSalesDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';

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

  // If not authenticated, redirect to landing page
  if (!isAuthenticated || !user) {
    router.push('/landing');
    return null;
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
        return <LinearHRDashboard />;
      case 'Finance':
        return <LinearFinanceDashboard />;
      case 'Sales & Marketing':
        return <LinearSalesDashboard />;
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