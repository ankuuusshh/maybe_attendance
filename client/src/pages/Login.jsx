import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanFace,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('ankush.raj@college.edu');
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // When role changes, pre-fill appropriate demo credentials
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      setEmail('ankush.raj@college.edu');
    } else if (selectedRole === 'teacher') {
      setEmail('rajesh.sharma@college.edu');
    } else if (selectedRole === 'admin') {
      setEmail('admin@college.edu');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(role, { email });
      setLoading(false);
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      }
    }, 400);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
    }, 2000);
  };

  return (
    <div className="login-root">
      <div className="login-container">
        {/* Left Branding Panel */}
        <div className="login-brand-panel">
          <div className="brand-panel-header">
            <div className="login-brand-badge">
              <ScanFace size={24} />
              <span>SmartPresence AI</span>
            </div>
          </div>

          <div className="brand-panel-content">
            <div className="ai-chip">
              <Sparkles size={14} /> Next-Gen Biometric Intelligence
            </div>
            <h2>Frictionless, AI-powered attendance for modern campuses.</h2>
            <p>
              Instantly recognize dozens of faces in high-resolution classroom snapshots with 99.2% accuracy powered by deep convolutional neural networks.
            </p>

            <div className="brand-features-list">
              <div className="brand-feature">
                <CheckCircle2 size={18} className="feature-check" />
                <span>One-click group photo recognition in under 2 seconds</span>
              </div>
              <div className="brand-feature">
                <CheckCircle2 size={18} className="feature-check" />
                <span>Multi-angle 128-d biometric facial encoding</span>
              </div>
              <div className="brand-feature">
                <CheckCircle2 size={18} className="feature-check" />
                <span>Automated defaulter tracking and instant analytics</span>
              </div>
            </div>
          </div>

          <div className="brand-panel-footer">
            <span>© 2026 Academic Information & Biometrics System</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            <div className="login-header-group">
              <div className="mobile-logo-icon">
                <ScanFace size={28} />
              </div>
              <h1 className="login-title">Attendance System</h1>
              <p className="login-subtitle">Smart AI-Powered Attendance</p>
            </div>

            {/* Development Role Selector */}
            <div className="dev-role-selector">
              <div className="dev-role-label">
                <span>Select Portal Role (Demo Simulation)</span>
              </div>
              <div className="role-pills">
                <button
                  type="button"
                  className={`role-pill ${role === 'student' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('student')}
                >
                  <GraduationCap size={16} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  className={`role-pill ${role === 'teacher' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('teacher')}
                >
                  <Briefcase size={16} />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  className={`role-pill ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('admin')}
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  College Email Address
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your institutional email"
                    className="form-input with-left-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label className="form-label" htmlFor="password-input">
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="form-input with-left-icon with-right-btn"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" defaultChecked />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            </form>

            <div className="login-note-box">
              <p>
                <strong>Demo Mode:</strong> Role selected above determines which dashboard opens on submission. In production, authentication is verified via JWT tokens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (UI Only) */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-container" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close-btn" onClick={() => setShowForgotModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {forgotSent ? (
                <div className="forgot-success">
                  <CheckCircle2 size={36} color="var(--success)" />
                  <h4>Reset Link Dispatched!</h4>
                  <p>A password reset link has been simulated for {forgotEmail || email}.</p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p className="forgot-desc">
                    Enter your college email address. We'll send an instructions link to reset your credentials.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@college.edu"
                      value={forgotEmail || email}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <Button variant="secondary" onClick={() => setShowForgotModal(false)} fullWidth>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" fullWidth>
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;