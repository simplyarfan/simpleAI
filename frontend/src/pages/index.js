import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LivelyHRDashboard from '../components/user/LivelyHRDashboard';
import LivelyFinanceDashboard from '../components/user/LivelyFinanceDashboard';
import LivelySalesDashboard from '../components/user/LivelySalesDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import WaitingDashboard from '../components/user/WaitingDashboard';
import LandingPage from './landing';
import ClientOnly from '../components/shared/ClientOnly';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // TEST ENVIRONMENT INDICATOR
  const isTestEnvironment = true; // This will only be on test branch

  // Dashboard mapping for cleaner code
  const DASHBOARD_MAP = {
    'Human Resources': LivelyHRDashboard,
    'Finance': LivelyFinanceDashboard,
    'Sales & Marketing': LivelySalesDashboard
  };

  // Redirect superadmin users to /superadmin route
  useEffect(() => {
    if (!loading && isAuthenticated && user?.email === 'syedarfan@securemaxtech.com') {
      router.push('/superadmin');
    }
  }, [user, loading, isAuthenticated, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page directly
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // If superadmin, show loading while redirecting (prevents flash)
  if (user?.email === 'syedarfan@securemaxtech.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Helper function to render dashboard with test banner
  const renderDashboard = (Component) => (
    <>
      {isTestEnvironment && (
        <div style={{
          backgroundColor: '#ff6b00',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          borderBottom: '4px solid #ff4500'
        }}>
          🧪 TEST ENVIRONMENT - You are on the TEST branch
        </div>
      )}
      <Component />
    </>
  );

  // Route users based on their department
  if (user?.role === 'user') {
    // Get dashboard component from mapping or use WaitingDashboard
    const DashboardComponent = DASHBOARD_MAP[user?.department] || WaitingDashboard;
    return renderDashboard(DashboardComponent);
  }

  // Admin role gets admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Fallback - show waiting dashboard
  return <WaitingDashboard />;
};

// Wrap with ClientOnly to prevent SSR/build issues
export default function IndexPage() {
  return (
    <ClientOnly>
      <Dashboard />
    </ClientOnly>
  );
}