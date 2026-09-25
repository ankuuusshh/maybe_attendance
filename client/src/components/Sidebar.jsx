import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  ScanFace,
  User,
  LogOut,
  BookOpen,
  PlusCircle,
  Camera,
  BarChart3,
  Users,
  Building2,
  Library,
  FileCheck2,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'student';

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'My Classes', path: '/student/classes', icon: BookOpen },
    { name: 'Face Registration', path: '/student/face-registration', icon: ScanFace, highlight: true },
    { name: 'Profile', path: '/student/profile', icon: User }
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', path: '/teacher/classes', icon: BookOpen },
    { name: 'Create Classroom', path: '/teacher/create-classroom', icon: PlusCircle },
    { name: 'Take Attendance', path: '/teacher/take-attendance', icon: Camera, highlight: true },
    { name: 'Attendance History', path: '/teacher/attendance-result', icon: FileCheck2 },
    { name: 'Reports', path: '/teacher/reports', icon: BarChart3 }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Classrooms', path: '/admin/classrooms', icon: Building2 },
    { name: 'Subjects', path: '/admin/subjects', icon: Library },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 }
  ];

  let currentNavItems = studentLinks;
  let roleLabel = 'Student Portal';
  if (role === 'teacher') {
    currentNavItems = teacherLinks;
    roleLabel = 'Faculty Portal';
  } else if (role === 'admin') {
    currentNavItems = adminLinks;
    roleLabel = 'Admin Console';
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <ScanFace size={22} className="brand-logo-icon" />
          </div>
          <div className="sidebar-brand-text">
            <span className="brand-title">SmartPresence</span>
            <span className="brand-badge">
              <Sparkles size={10} /> AI ATTENDANCE
            </span>
          </div>
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Portal Identifier */}
        <div className="sidebar-portal-badge">
          <span className="portal-indicator-dot" />
          <span>{roleLabel}</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-title">Navigation</p>
          <ul className="sidebar-menu">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="sidebar-menu-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''} ${item.highlight ? 'link-highlight' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={18} className="sidebar-link-icon" />
                    <span className="sidebar-link-label">{item.name}</span>
                    {item.highlight && <span className="ai-tag">AI</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Card & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={user?.name || 'User Avatar'}
              className="sidebar-user-avatar"
            />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={user?.name}>
                {user?.name || 'Logged User'}
              </span>
              <span className="sidebar-user-meta">
                {user?.rollNo || user?.empId || user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <button className="sidebar-logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
