
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Handle clicks outside components to ensure events don't get stuck
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // This acts as a global event handler to ensure clicks propagate properly
      if (e.target && (e.target as HTMLElement).classList.contains('fixed-overlay')) {
        setSidebarOpen(false);
      }
    };

    // Handle ESC key to close modals/popovers that might block interaction
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64 transition-all duration-300 pt-4 px-4 pb-8">
        <Outlet />
      </main>
      
      {/* Only show overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed-overlay fixed inset-0 bg-black/20 lg:bg-transparent lg:pointer-events-none z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;
