import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  FileCheck2,
  Download,
  Share2,
  Calendar,
  Users
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { DUMMY_AI_STUDENTS_RESULT } from '../../data/dummyData';

const AttendanceResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If redirected from take-attendance with state, use that, else use default simulation
  const sessionData = location.state || {
    classroom: 'CSE-4A',
    subject: 'Data Structures (CS401)',
    date: '2026-09-26',
    time: '10:00 AM - 11:00 AM',
    totalStudents: 42,
    present: 38,
    absent: 4,
    unknownFaces: 2,
    avgConfidence: '95.4%',
    students: DUMMY_AI_STUDENTS_RESULT
  };

  const [confirmed, setConfirmed] = useState(false);

  const handleFinalConfirm = () => {
    setConfirmed(true);
  };

  return (
    <div className="attendance-result-page">
      <PageHeader
        title="Attendance Session Summary"
        subtitle={`Session audit for ${sessionData.subject} • ${sessionData.classroom}`}
        backTo="/teacher/dashboard"
        backText="Dashboard"
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => alert('Attendance report exported to CSV (Simulation)')}
            >
              Export Report
            </Button>
            {!confirmed && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/teacher/take-attendance')}
              >
                Edit Attendance
              </Button>
            )}
          </div>
        }
      />

      {confirmed && (
        <div
          style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            color: 'var(--success-text)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <CheckCircle2 size={24} color="var(--success)" />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '2px' }}>
              Attendance Officially Confirmed & Archived!
            </h4>
            <p style={{ fontSize: '0.85rem' }}>
              The attendance records have been synchronized with the institutional academic registry.
            </p>
          </div>
        </div>
      )}

      {/* Session Metadata Banner */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: '6px' }}>Verified Session</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{sessionData.subject}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Classroom: <strong>{sessionData.classroom}</strong> • Date: <strong>{sessionData.date}</strong> ({sessionData.time})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '12px 18px', borderRadius: 'var(--radius-md)' }}>
            <Sparkles size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                AI Model Accuracy
              </span>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {sessionData.avgConfidence || '95.4%'} Average Match
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="result-kpi-card">
          <span className="kpi-label">Total Registered</span>
          <h3 className="kpi-val" style={{ color: 'var(--text-main)' }}>{sessionData.totalStudents}</h3>
          <span className="kpi-sub">Students in classroom</span>
        </div>

        <div className="result-kpi-card">
          <span className="kpi-label">Present</span>
          <h3 className="kpi-val" style={{ color: 'var(--success)' }}>{sessionData.present}</h3>
          <span className="kpi-sub">
            {((sessionData.present / (sessionData.totalStudents || 1)) * 100).toFixed(1)}% Present rate
          </span>
        </div>

        <div className="result-kpi-card">
          <span className="kpi-label">Absent</span>
          <h3 className="kpi-val" style={{ color: 'var(--danger)' }}>{sessionData.absent}</h3>
          <span className="kpi-sub">Flagged as unverified</span>
        </div>

        <div className="result-kpi-card">
          <span className="kpi-label">Unknown Faces</span>
          <h3 className="kpi-val" style={{ color: 'var(--warning)' }}>{sessionData.unknownFaces}</h3>
          <span className="kpi-sub">Unmatched in database</span>
        </div>
      </div>

      {/* Verified Students Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Verified Student Attendance Roster</h3>
          <span className="badge badge-safe">AI Processed</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>AI Match Confidence</th>
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {sessionData.students.map((st) => (
                <tr key={st.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={st.avatar}
                        alt={st.name}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 700 }}>{st.name}</span>
                    </div>
                  </td>
                  <td><code>{st.rollNo}</code></td>
                  <td>
                    <span style={{ fontWeight: 700, color: st.confidence >= 90 ? 'var(--success)' : 'var(--warning)' }}>
                      {st.confidence}%
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={st.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/teacher/dashboard')}
          >
            Back to Dashboard
          </Button>

          {!confirmed && (
            <Button
              variant="primary"
              size="md"
              icon={FileCheck2}
              onClick={handleFinalConfirm}
            >
              Confirm & Save Attendance
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceResult;
