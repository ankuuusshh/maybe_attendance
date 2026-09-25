import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  ScanFace,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { STUDENT_SUBJECT_ATTENDANCE, STUDENT_ATTENDANCE_LOGS } from '../../data/dummyData';
import './StudentPages.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalClasses = STUDENT_SUBJECT_ATTENDANCE.reduce((acc, curr) => acc + curr.total, 0);
  const totalPresent = STUDENT_SUBJECT_ATTENDANCE.reduce((acc, curr) => acc + curr.present, 0);
  const totalAbsent = totalClasses - totalPresent;
  const overallPercentage = ((totalPresent / totalClasses) * 100).toFixed(1);

  return (
    <div className="student-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text-wrap">
          <span className="welcome-tag">Student Attendance Portal</span>
          <h2>Welcome back, {user?.name || 'Ankush Raj'}! 👋</h2>
          <p>
            Roll No: <strong>{user?.rollNo || '24105129015'}</strong> • {user?.department || 'Computer Science & Engineering'} • Semester 4
          </p>
        </div>

        <div className="welcome-biometric-status">
          <div className="biometric-icon-ring">
            <ScanFace size={24} />
          </div>
          <div className="biometric-info">
            <span className="biometric-label">Face Recognition Status</span>
            <div className="biometric-badge-row">
              <StatusBadge status="Registered" text="5 Biometric Samples Enrolled" />
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '28px' }}>
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          subtitle="Minimum 75% required"
          icon={CalendarCheck}
          color={Number(overallPercentage) >= 75 ? 'primary' : 'danger'}
          progress={Number(overallPercentage)}
          trend="+1.8% this week"
          trendType="up"
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          subtitle="Across 5 active subjects"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Present"
          value={totalPresent}
          subtitle="Classes attended"
          icon={CheckCircle}
          color="success"
          trend="Regular"
          trendType="up"
        />
        <StatCard
          title="Absent"
          value={totalAbsent}
          subtitle="Excused & unexcused"
          icon={XCircle}
          color="danger"
          trend="Watch Limit"
          trendType="down"
        />
      </div>

      {/* Attendance Warning Alert if any subject < 75% */}
      {STUDENT_SUBJECT_ATTENDANCE.some((s) => s.percentage < 75) && (
        <div className="dashboard-alert warning-alert">
          <AlertTriangle size={20} className="alert-icon" />
          <div className="alert-content">
            <h4>Attendance Defaulter Warning</h4>
            <p>
              Your attendance in <strong>Mathematics IV (64%)</strong> is currently below the mandatory 75% university eligibility threshold. Attend upcoming sessions to avoid debarment.
            </p>
          </div>
        </div>
      )}

      {/* Subject-Wise Attendance Breakdown */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Subject-Wise Attendance</h3>
            <p className="card-subtitle">Live breakdown and eligibility index across current curriculum</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/student/attendance')}
          >
            Detailed Records
          </Button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject & Code</th>
                <th>Instructor</th>
                <th>Present / Total</th>
                <th>Progress</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDENT_SUBJECT_ATTENDANCE.map((sub) => {
                let badgeClass = 'badge-safe';
                if (sub.status === 'Warning') badgeClass = 'badge-warning';
                if (sub.status === 'Low') badgeClass = 'badge-danger';

                return (
                  <tr key={sub.id}>
                    <td>
                      <div className="table-subject-cell">
                        <span className="subject-name">{sub.subject}</span>
                        <span className="subject-code">{sub.code}</span>
                      </div>
                    </td>
                    <td>{sub.faculty}</td>
                    <td>
                      <strong>{sub.present}</strong> / {sub.total}
                    </td>
                    <td style={{ minWidth: '130px' }}>
                      <div className="subject-progress-track">
                        <div
                          className={`subject-progress-bar ${
                            sub.percentage >= 80 ? 'fill-green' : sub.percentage >= 75 ? 'fill-amber' : 'fill-red'
                          }`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <strong
                        style={{
                          color:
                            sub.percentage >= 80 ? 'var(--success)' : sub.percentage >= 75 ? 'var(--warning)' : 'var(--danger)'
                        }}
                      >
                        {sub.percentage}%
                      </strong>
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance Activity */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Attendance Activity</h3>
            <p className="card-subtitle">Automated classroom recognition snapshots and verification history</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Subject</th>
                <th>Classroom</th>
                <th>Faculty</th>
                <th>Verification Engine</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDENT_ATTENDANCE_LOGS.slice(0, 5).map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{log.date}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                    </div>
                  </td>
                  <td><strong>{log.subject}</strong></td>
                  <td>{log.class}</td>
                  <td>{log.faculty}</td>
                  <td>
                    <span className="verification-badge">
                      <ShieldCheck size={13} color="var(--primary)" />
                      {log.method}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
