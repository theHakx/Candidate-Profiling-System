import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import './layout.scss';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // This prevents the initial animation on page load
    const timer = setTimeout(() => setIsInitialLoad(false), 10);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`layoutContainer ${isInitialLoad ? 'initial-load' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`mainContent ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="pageContent">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;