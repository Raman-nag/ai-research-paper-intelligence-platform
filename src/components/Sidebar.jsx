import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Network, 
  Search, 
  Bot, 
  FileText, 
  BarChart2, 
  LayoutDashboard
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
  { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },

  // NEW PAGE
  { path: '/paper-analysis', name: 'Paper Analysis', icon: <FileText size={20} /> },

  { path: '/search', name: 'Semantic Search', icon: <Search size={20} /> },
  { path: '/assistant', name: 'AI Assistant', icon: <Bot size={20} /> },
  { path: '/graph', name: 'Knowledge Graph', icon: <Network size={20} /> },
  { path: '/summaries', name: 'Summaries', icon: <FileText size={20} /> },
  { path: '/evaluation', name: 'Evaluation', icon: <BarChart2 size={20} /> },
];

  return (
    <aside className="cyberpunk-sidebar">
      <div className="sidebar-logo">
        <Network className="logo-icon" size={32} color="var(--neon-cyan)" />
        <h1 className="brand-font text-gradient">ArXiv<br/>Graph</h1>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
            <span className="nav-glow"></span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
