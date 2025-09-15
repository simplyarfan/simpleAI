import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import RegularDashboard from '../components/RegularDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Check if user is the specific superadmin
  const isSuperAdmin = user?.email === 'syedarfan@securemaxtech.com';

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  return <RegularDashboard />;
};

export default Dashboard;