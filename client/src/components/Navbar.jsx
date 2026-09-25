import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, Check, UserCheck, Shield, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleRoleChange = (role) => {
    switchRole(role);
    setDropdownOpen(false);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
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
          <span className="institute-badge">B.Tech Engineering Portal</span>
          <span className="session-text">Session: 2025 - 2026</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Role Switcher for Developer / Evaluator convenience */}
        <div className="role-switcher-container">
          <button
            className="role-switcher-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Switch demo role"
          >
            <span className="role-icon-wrap">{getRoleIcon(user?.role)}</span>
            <span className="role-btn-text">
              Role: <strong className="capitalize">{user?.role || 'student'}</strong>
            </span>
            <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'rotate' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="role-dropdown-menu">
              <div className="role-dropdown-header">Switch Demo Perspective</div>
              <button
                className={`role-dropdown-item ${user?.role === 'student' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('student')}
              >
                <GraduationCap size={16} />
                <div className="role-item-text">
                  <span className="item-title">Student View</span>
                  <span className="item-desc">Ankush Raj (Roll: 24105129015)</span>
                </div>
                {user?.role === 'student' && <Check size={16} className="item-check" />}
              </button>

              <button
                className={`role-dropdown-item ${user?.role === 'teacher' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('teacher')}
              >
                <Briefcase size={16} />
                <div className="role-item-text">
                  <span className="item-title">Teacher View</span>
                  <span className="item-desc">Prof. Dr. Rajesh Sharma (CSE)</span>
                </div>
                {user?.role === 'teacher' && <Check size={16} className="item-check" />}
              </button>

              <button
                className={`role-dropdown-item ${user?.role === 'admin' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('admin')}
              >
                <Shield size={16} />
                <div className="role-item-text">
                  <span className="item-title">Admin View</span>
                  <span className="item-desc">Dr. Vikram Sen (Dean Academics)</span>
                </div>
                {user?.role === 'admin' && <Check size={16} className="item-check" />}
              </button>
            </div>
          )}
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
                    <strong>AI Attendance Processed:</strong> Data Structures (42/42 students scanned)
                  </p>
                  <span className="notification-time">10 mins ago</span>
                </div>
                <div className="notification-item">
                  <p className="notification-text">
                    <strong>Face Embeddings:</strong> High match confidence (96.4%) recorded today.
                  </p>
                  <span className="notification-time">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="navbar-user-pill">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
            alt={user?.name}
            className="navbar-avatar"
          />
          <div className="navbar-user-details">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{user?.department || 'Department of CSE'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
