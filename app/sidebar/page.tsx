'use client'

import React, { useState } from 'react';
import { FiBook, FiMap, FiLogOut, FiSearch, FiMenu, FiX, FiLayers } from 'react-icons/fi';

interface SidebarProps {
  activeSection: 'books' | 'libraries';
  onSectionChange: (section: 'books' | 'libraries') => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, onSearch, onLogout }: SidebarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const navItems = [
    { id: 'books', icon: FiBook, label: 'Collection' },
    { id: 'libraries', icon: FiMap, label: 'Branches' }
  ];

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <FiLayers className="brand-icon" />
          </div>
          <span className="brand-text">Libris</span>
        </div>

        <div className="search-wrapper">
          <FiSearch style={{position:'absolute', margin:'15px 15px' }} className="search-inner-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={query}
            onChange={handleSearchChange}
          />
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                onSectionChange(item.id as 'books' | 'libraries');
                setIsOpen(false);
              }}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
              {activeSection === item.id && <div className="active-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-link logout" onClick={onLogout}>
            <FiLogOut className="nav-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style jsx>{`
        .mobile-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 100;
          background: #1c2128;
          border: 1px solid #30363d;
          color: #fff;
          padding: 10px;
          border-radius: 12px;
          display: none;
          cursor: pointer;
        }

        .sidebar-container {
          width: 280px;
          background: #161b22;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          border-right: 1px solid #30363d;
          z-index: 90;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
          padding: 0 8px;
        }

        .brand-icon-wrapper {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #58a6ff, #238636);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(88, 166, 255, 0.2);
        }

        .brand-icon { color: white; font-size: 20px; }
        .brand-text { font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }

        .search-wrapper {
          position: relative;
          margin-bottom: 32px;
          display:flex;
          align-item:flex-start;
          justify-content:space-between
        }

        .search-inner-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #8b949e;
        }

        .search-input {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          padding: 14px 16px 14px 44px;
          border-radius: 16px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
          display:flex;
          align-item:center;
          justify-content:center;
        }

        .search-input:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
        }

        .nav-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          background: transparent;
          border: none;
          color: #8b949e;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-align: left;
          width:100%
        }

        .nav-link:hover { background: #21262d; color: #fff; }
        
        .nav-link.active { background: linear-gradient(135deg, #58a6ff, #238636); color: #fff; }

        .nav-icon { font-size: 20px; }

        .active-indicator {
          position: absolute;
          right: 16px;
          width: 6px;
          height: 6px;
          background: #58a6ff;
          border-radius: 50%;
          box-shadow: 0 0 10px #58a6ff;
        }

        .sidebar-bottom { margin-top: auto; border-top: 1px solid #30363d; padding-top: 24px; }
        .logout:hover { color: #f85149; background: rgba(248, 81, 73, 0.1); }

        @media (max-width: 768px) {
          .mobile-toggle { display: block; }
          .sidebar-container { transform: translateX(-100%); }
          .sidebar-container.open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;