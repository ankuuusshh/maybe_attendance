import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle, XCircle, Clock, ScanFace, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { attendanceApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './StudentPages.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load attendance summary
    attendanceApi.getStudentSummary()
      .then((data) => {
        const arr = Array.isArray(data) ? data : (data?.summary || []);
        if (arr.length > 0) {
          const totalClasses = arr.reduce((acc, c) => acc + (c.totalClasses || 0), 0);
          const present = arr.reduce((acc, c) => acc + (c.present || 0), 0);
          const absent = arr.reduce((acc, c) => acc + (c.absent || 0), 0);
          const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;
          setSummary({ totalClasses, present, absent, percentage });
        } else {
          setSummary({ totalClasses: 0, present: 0, absent: 0, percentage: 0 });
        }
      })
      .catch((err) => setError(err.message || 'Failed to load attendance summary'))
      .finally(() => setLoadingSummary(false));

    // Load recent attendance logs
    attendanceApi.getStudentAttendance()
      .then((data) => {
        const logs = Array.isArray(data) ? data : (data?.attendance || []);
        setRecentLogs(logs.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, []);

  const totalClasses = summary?.totalClasses ?? 0;
  const totalPresent = summary?.present ?? 0;
  const totalAbsent = summary?.absent ?? 0;
  const percentage = summary?.percentage ?? 0;

  return (
    <div className="student-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text-wrap">
          <span className="welcome-tag">Student Attendance Portal</span>
          <h2>Welcome back, {user?.name || 'Student'}! 👋</h2>
          <p>
            {user?.email}
            {user?.department ? ` • ${user.department}` : ''}
          </p>
        </div>

        <div className="welcome-biometric-status">
          <div className="biometric-icon-ring">
            <ScanFace size={22} />
          </div>
          <div className="biometric-info">
            <span className="biometric-label">Face Recognition</span>
            <div className="biometric-badge-row">
              <StatusBadge status="Registered" text="Biometric Enrolled" />
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/student/face-registration')}
          >
            Manage Face
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {loadingSummary ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      ) : (
        <div className="grid grid-cols-4" style={{ marginBottom: '28px' }}>
          <StatCard
            title="Overall Attendance"
            value={`${percentage}%`}
            subtitle="Minimum 75% required"
            icon={CalendarCheck}
            color={Number(percentage) >= 75 ? 'success' : 'danger'}
            progress={Number(percentage)}
          />
          <StatCard
            title="Total Classes"
            value={totalClasses}
            subtitle="Across all classrooms"
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Present"
            value={totalPresent}
            subtitle="Classes attended"
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Absent"
            value={totalAbsent}
            subtitle="Missed classes"
            icon={XCircle}
            color="danger"
          />
        </div>
      )}

      {/* Attendance Warning */}
      {!loadingSummary && Number(percentage) < 75 && totalClasses > 0 && (
        <div className="dashboard-alert warning-alert" style={{ marginBottom: '28px' }}>
          <AlertTriangle size={20} className="alert-icon" />
          <div className="alert-content">
            <h4>Attendance Below Threshold</h4>
            <p>
              Your overall attendance is <strong>{percentage}%</strong>, which is below
              the mandatory 75% eligibility requirement.
            </p>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Attendance Activity</h3>
            <p className="card-subtitle">Latest recorded class attendances</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/attendance')}>
            View All
          </Button>
        </div>

        {loadingLogs ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Loader2 size={24} className="animate-spin" color="var(--primary)" />
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <CalendarCheck size={36} color="var(--border)" />
            <h4>No attendance records yet</h4>
            <p>Attendance records will appear here once marked by your teachers.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Classroom</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, i) => (
                  <tr key={log._id || i}>
                    <td>
                      <strong>{new Date(log.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</strong>
                    </td>
                    <td>{log.classroom?.name || '—'}</td>
                    <td>{log.classroom?.subject || '—'}</td>
                    <td>
                      <StatusBadge status={log.status === 'present' ? 'Present' : 'Absent'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
