import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Clock,
  Camera,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  FolderOpen,
  Copy,
  Check,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import { classroomApi } from '../../services/api';
import './TeacherPages.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    classroomApi.getTeacherClassrooms()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.classrooms || [];
        setClassrooms(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalClassrooms = classrooms.length;
  const totalStudents = classrooms.reduce(
    (acc, c) => acc + (c.students?.length || 0),
    0
  );

  return (
    <div className="teacher-dashboard">
      {/* Welcome Hero */}
      <div className="teacher-welcome-banner">
        <div className="welcome-text-wrap">
          <span className="welcome-tag">Faculty Administration Portal</span>
          <h2>Welcome, {user?.name || 'Teacher'} 👋</h2>
          <p>
            {user?.email}
            {user?.department ? ` • ${user.department}` : ''}
          </p>
        </div>

        <div className="teacher-quick-actions">
          <Button
            variant="primary"
            size="md"
            icon={Camera}
            onClick={() => navigate('/teacher/take-attendance')}
          >
            Take Attendance
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/teacher/create-classroom')}
          >
            Create Classroom
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Statistics */}
      <div className="grid grid-cols-4" style={{ marginBottom: '28px' }}>
        <StatCard
          title="Total Classrooms"
          value={loading ? '—' : totalClassrooms}
          subtitle="Active assigned sections"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Enrolled Students"
          value={loading ? '—' : totalStudents}
          subtitle="Across your classrooms"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Semester Status"
          value="Active"
          subtitle="Current academic term"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Attendance Mode"
          value="Manual & AI"
          subtitle="Biometric assisted"
          icon={CalendarCheck}
          color="success"
        />
      </div>

      {/* Classrooms Section */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">My Teaching Classrooms</h3>
            <p className="card-subtitle">
              Quick access to take attendance or review class records
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/classes')}
          >
            View All ({classrooms.length})
          </Button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={28} className="animate-spin" color="var(--primary)" />
          </div>
        ) : classrooms.length === 0 ? (
          <div className="empty-state" style={{ padding: '36px 0' }}>
            <FolderOpen size={44} color="var(--border)" />
            <h4>No Classrooms Yet</h4>
            <p>Create your first classroom to begin enrolling students and tracking attendance.</p>
            <Button
              variant="primary"
              size="md"
              icon={PlusCircle}
              onClick={() => navigate('/teacher/create-classroom')}
            >
              Create Classroom
            </Button>
          </div>
        ) : (
          <div className="todays-classes-grid">
            {classrooms.slice(0, 4).map((cls) => (
              <div key={cls._id} className="today-class-card">
                <div className="today-class-header">
                  <div>
                    <span className="today-class-code">
                      {cls.semester} • Sec {cls.section}
                    </span>
                    <h4 className="today-class-title">{cls.name}</h4>
                  </div>
                  <span className="badge badge-primary">
                    {cls.students?.length || 0} Students
                  </span>
                </div>

                <div className="today-class-body">
                  <div className="today-class-info-row">
                    <BookOpen size={16} color="var(--primary)" />
                    <span>Subject: <strong>{cls.subject}</strong></span>
                  </div>
                  <div className="today-class-info-row">
                    <Users size={16} color="var(--text-muted)" />
                    <span>Enrolled: <strong>{cls.students?.length || 0} Students</strong></span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 10px',
                      marginTop: '6px',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <Hash size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Join Code
                        </span>
                        <code
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            fontFamily: 'var(--font-mono)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={cls._id}
                        >
                          {cls._id}
                        </code>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(cls._id)}
                      title={copiedId === cls._id ? 'Copied!' : 'Copy Classroom ID'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: copiedId === cls._id ? 'var(--success-light)' : '#ffffff',
                        color: copiedId === cls._id ? 'var(--success-text)' : 'var(--text-main)',
                        border: `1px solid ${
                          copiedId === cls._id ? 'var(--success-border)' : 'var(--border)'
                        }`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                    >
                      {copiedId === cls._id ? (
                        <>
                          <Check size={11} color="var(--success)" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="today-class-footer" style={{ gap: '8px' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Camera}
                    onClick={() =>
                      navigate('/teacher/take-attendance', {
                        state: { classroomId: cls._id },
                      })
                    }
                  >
                    Take Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate('/teacher/attendance-result', {
                        state: { classroomId: cls._id },
                      })
                    }
                  >
                    Records
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Attendance Feature Callout Banner */}
      <div className="ai-feature-banner">
        <div className="ai-banner-content">
          <div className="ai-badge-pill">
            <Sparkles size={14} /> AI Biometric Attendance
          </div>
          <h3>Automate Student Roll Calls with Instant Face Recognition</h3>
          <p>
            Capture a lecture hall snapshot. Our system maps facial landmarks against student enrollments,
            letting you verify and submit official attendance in seconds.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/teacher/take-attendance')}
          >
            Launch Attendance Scanner
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
