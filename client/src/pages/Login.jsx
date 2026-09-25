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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-container">

        {/* ── Left Branding Panel ── */}
        <div className="login-brand-panel">
          <div className="brand-panel-header">
            <div className="login-brand-badge">
              <ScanFace size={22} />
              <span>SmartPresence AI</span>
            </div>
          </div>

          <div className="brand-panel-content">
            <div className="ai-chip">
              <Sparkles size={13} /> Next-Gen Biometric Intelligence
            </div>
            <h2>Frictionless, AI-powered attendance for modern campuses.</h2>
            <p>
              Instantly recognize dozens of faces in high-resolution classroom
              snapshots with 99.2% accuracy powered by deep convolutional neural
              networks.
            </p>

            <div className="brand-features-list">
              {[
                'One-click group photo recognition in under 2 seconds',
                'Multi-angle 128-d biometric facial encoding',
                'Automated defaulter tracking and instant analytics',
              ].map((feature) => (
                <div className="brand-feature" key={feature}>
                  <CheckCircle2 size={16} className="feature-check" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Decorative orbs */}
            <div className="brand-orb brand-orb-1" />
            <div className="brand-orb brand-orb-2" />
          </div>

          <div className="brand-panel-footer">
            <span>© 2026 Academic Information &amp; Biometrics System</span>
          </div>
        </div>

        {/* ── Right Form Card ── */}
        <div className="login-form-panel">
          <div className="login-form-inner">

            <div className="login-header-group">
              <div className="mobile-logo-icon">
                <ScanFace size={26} />
              </div>
              <h1 className="login-title">Welcome back</h1>
              <p className="login-subtitle">Sign in to your attendance portal</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="login-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  College Email Address
                </label>
                <div className="input-with-icon">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@college.edu"
                    className="form-input with-left-icon"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label className="form-label" htmlFor="password-input">
                    Password
                  </label>
                </div>
                <div className="input-with-icon">
                  <Lock size={17} className="field-icon" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="form-input with-left-icon with-right-btn"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
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
                Sign In to Portal
              </Button>
            </form>

            {/* Role Hint */}
            <div className="login-hint-grid">
              <div className="login-hint-card">
                <GraduationCap size={16} />
                <span>Student</span>
              </div>
              <div className="login-hint-card">
                <Briefcase size={16} />
                <span>Faculty</span>
              </div>
              <div className="login-hint-card">
                <Shield size={16} />
                <span>Admin</span>
              </div>
            </div>

            <p className="login-note">
              Your role is automatically determined from your registered account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;