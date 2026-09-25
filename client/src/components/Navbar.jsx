import React, { useState } from 'react';
import { Menu, Bell, Shield, GraduationCap, Briefcase, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    if (role === 'student') return <GraduationCap size={14} />;
    if (role === 'teacher') return <Briefcase size={14} />;
    return <Shield size={14} />;
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-academic-tag">
          <span className="institute-badge">College Attendance Portal</span>
          <span className="session-text">Session: 2025 - 2026</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Active Role Indicator */}
        <div className="role-switcher-container">
          <div className="role-switcher-btn" style={{ cursor: 'default' }}>
            <span className="role-icon-wrap">{getRoleIcon(user?.role)}</span>
            <span className="role-btn-text">
              Role: <strong className="capitalize">{user?.role || 'student'}</strong>
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="navbar-notifications-wrap">
          <button
            className="navbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="notification-badge-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-popover">
              <div className="notifications-header">
                <h4>System Alerts</h4>
                <span className="badge badge-info">2 New</span>
              </div>
              <div className="notifications-list">
                <div className="notification-item">
                  <p className="notification-text">
                    <strong>Attendance Session Synchronized:</strong> Live database connection established.
                  </p>
                  <span className="notification-time">Just now</span>
                </div>
                <div className="notification-item">
                  <p className="notification-text">
                    <strong>System Status:</strong> API gateway connected and operational.
                  </p>
                  <span className="notification-time">Today</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="navbar-user-pill">
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="navbar-user-details">
            <span className="navbar-user-name">{user?.name || 'User'}</span>
            <span className="navbar-user-role">{user?.email || 'Logged in'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
