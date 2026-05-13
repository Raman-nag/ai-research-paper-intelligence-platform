import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Background3D from './ui/Background3D';
import { Menu, X } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container">
      <Background3D />
      
      {/* Mobile Header for hamburger menu */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <span className="brand-font text-gradient">ArXiv Graph</span>
        </div>
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;
