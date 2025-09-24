import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import ModernLogin from '../../components/auth/ModernLogin';
import toast from 'react-hot-toast';

const Login = () => {
  const router = useRouter();
  const { login, loading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = router.query.returnUrl || '/';
      router.push(returnUrl);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (formData) => {
    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success('Welcome back!');
        const returnUrl = router.query.returnUrl || '/';
        router.push(returnUrl);
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <ModernLogin onLogin={handleLogin} loading={loading} />;
};

export default Login;