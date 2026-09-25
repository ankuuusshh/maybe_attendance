import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Clock,
  Camera,
  PlusCircle,
  BarChart3,
  ArrowRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { TEACHER_TODAYS_CLASSES } from '../../data/dummyData';
import './TeacherPages.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="teacher-dashboard">
      {/* Welcome Hero */}
      <div className="teacher-welcome-banner">
        <div className="welcome-text-wrap">
          <span className="welcome-tag">Faculty Administration Portal</span>
          <h2>Welcome, {user?.name || 'Prof. Dr. Rajesh Sharma'}</h2>
          <p>
            {user?.designation || 'Associate Professor & HOD'} • {user?.department || 'Department of Computer Science & Engineering'}
          </p>
        </div>

        <div className="teacher-quick-actions">
          <Button
            variant="primary"
            size="md"
            icon={Camera}
            onClick={() => navigate('/teacher/take-attendance')}
          >
            Take AI Attendance
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
          value="4"
          subtitle="Assigned active sections"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Total Students"
          value="168"
          subtitle="Enrolled across courses"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Today's Classes"
          value="3"
          subtitle="2 Completed • 1 Upcoming"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Today's Attendance"
          value="92.4%"
          subtitle="Average student presence"
          icon={CalendarCheck}
          color="success"
          trend="+3.2%"
          trendType="up"
        />
      </div>

      {/* Today's Classes List */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Today's Class Schedule</h3>
            <p className="card-subtitle">Conduct lectures and launch instant AI facial attendance scanning</p>
          </div>
          <span className="badge badge-info">3 Lectures Scheduled Today</span>
        </div>

        <div className="todays-classes-grid">
          {TEACHER_TODAYS_CLASSES.map((session) => (
            <div key={session.id} className="today-class-card">
              <div className="today-class-header">
                <div>
                  <span className="today-class-code">{session.subjectCode} • {session.classroom}</span>
                  <h4 className="today-class-title">{session.subject}</h4>
                </div>
                <StatusBadge status={session.status} />
              </div>

              <div className="today-class-body">
                <div className="today-class-info-row">
                  <Clock size={16} color="var(--primary)" />
                  <span>{session.time}</span>
                </div>
                <div className="today-class-info-row">
                  <MapPin size={16} color="var(--text-muted)" />
                  <span>{session.room}</span>
                </div>
                <div className="today-class-info-row">
                  <Users size={16} color="var(--text-muted)" />
                  <span>{session.totalStudents} Registered Students</span>
                </div>
              </div>

              <div className="today-class-footer">
                {session.status === 'Completed' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--success-text)', fontWeight: 600 }}>
                      Attendance: <strong>{session.attendancePercentage}% Recorded</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/teacher/attendance-result')}
                    >
                      View Report
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Camera}
                    fullWidth
                    onClick={() => navigate('/teacher/take-attendance')}
                  >
                    Take Attendance Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Attendance Feature Callout Banner */}
      <div className="ai-feature-banner">
        <div className="ai-banner-content">
          <div className="ai-badge-pill">
            <Sparkles size={14} /> AI Biometric Attendance
          </div>
          <h3>Save 15 minutes every lecture with Instant Face Recognition</h3>
          <p>
            Simply capture a single classroom photo from your phone or webcam. Our neural net detects every student, calculates 128-d encodings, and flags absent students automatically.
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
