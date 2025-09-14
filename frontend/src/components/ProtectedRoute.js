import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (requireAuth && !isAuthenticated) {
      // User must be authenticated but isn't
      const currentPath = router.asPath;
      router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!requireAuth && isAuthenticated) {
      // User shouldn't be authenticated but is (e.g., login page)
      router.push('/');
      return;
    }

    if (requiredRole && user && user.role !== requiredRole) {
      // User doesn't have required role
      router.push('/unauthorized');
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, isAuthenticated, requireAuth, requiredRole, router]);

  // Show loading spinner while checking auth
  if (loading || (requireAuth && !isAuthorized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children if authorized or if no auth required
  if (isAuthorized || !requireAuth) {
    return children;
  }

  // Fallback - shouldn't reach here but just in case
  return null;
};

export default ProtectedRoute;