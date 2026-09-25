import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  CalendarCheck,
  Cpu,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Server
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { INITIAL_STUDENTS, INITIAL_TEACHERS } from '../../data/dummyData';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const deptAttendance = [
    { name: 'Computer Science & Engineering', attendance: 91.2, students: 480, status: 'Safe' },
    { name: 'Information Technology', attendance: 88.5, students: 320, status: 'Safe' },
    { name: 'Electronics & Communication', attendance: 82.4, students: 260, status: 'Safe' },
    { name: 'Mechanical Engineering', attendance: 76.8, students: 190, status: 'Warning' }
  ];

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Institutional Admin Console"
        subtitle="Campus-wide overview of students, faculty, biometric status, and live attendance metrics"
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={GraduationCap}
              onClick={() => navigate('/admin/students')}
            >
              Manage Students
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Users}
              onClick={() => navigate('/admin/teachers')}
            >
              Manage Faculty
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Students"
          value="1,250"
          subtitle="Enrolled across 4 branches"
          icon={GraduationCap}
          color="primary"
          trend="+12% this year"
          trendType="up"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Faculty Members"
          value="64"
          subtitle="Full-time academic staff"
          icon={Users}
          color="purple"
          onClick={() => navigate('/admin/teachers')}
        />
        <StatCard
          title="Active Classrooms"
          value="38"
          subtitle="Across 3 lecture blocks"
          icon={Building2}
          color="warning"
          onClick={() => navigate('/admin/classrooms')}
        />
        <StatCard
          title="Campus Attendance"
          value="89.2%"
          subtitle="Daily institutional average"
          icon={CalendarCheck}
          color="success"
          progress={89.2}
        />
      </div>

      {/* AI System Health & Biometrics Readiness */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)'
            }}>
              <Cpu size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI Vision Biometric Subsystem</span>
                <span className="badge badge-safe" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  Service Operational
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                Face Recognition Pipeline • 1,180 / 1,250 (94.4%) Student Face Vectors Enrolled
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              onClick={() => navigate('/admin/reports')}
            >
              View System Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Department-wise Attendance Performance */}
      <div className="grid grid-cols-3" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Attendance Performance</h3>
              <p className="card-subtitle">Aggregate attendance index tracked across engineering departments</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/admin/reports')}
            >
              Full Analytics
            </Button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Enrolled Students</th>
                  <th>Attendance %</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {deptAttendance.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.students} Students</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '100px', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${d.attendance}%`,
                              height: '100%',
                              backgroundColor: d.attendance >= 85 ? 'var(--success)' : 'var(--warning)'
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700 }}>{d.attendance}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Biometric Audit Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Audit Feed</h3>
            <span className="badge badge-neutral">Live</span>
          </div>

          <div style={{ display: 'flex', flexDirectioN: 'column', gap: '14px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <strong>CSE-4A Attendance Verified</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>Prof. Dr. Rajesh Sharma scanned 42 students via AI.</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>12 mins ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <strong>Face Sample Registered</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>Sneha Patel added 5 biometric angles.</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>45 mins ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <strong>Defaulter Threshold Triggered</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>Aman Singh attendance fell to 68.4%.</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
