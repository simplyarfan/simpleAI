import { useState } from 'react';
import { motion } from 'framer-motion';
import ModernSidebar from './ModernSidebar';
import { cn } from '../../lib/utils';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ModernSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <motion.main
        className="flex-1 overflow-hidden"
        animate={{ 
          marginLeft: 0,
          width: sidebarCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 256px)' 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
