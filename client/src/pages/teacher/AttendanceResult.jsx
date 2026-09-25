import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck2,
  Download,
  Calendar,
  Users,
  Trash2,
  Loader2,
  Filter,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { classroomApi, attendanceApi } from '../../services/api';

const AttendanceResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(
    location.state?.classroomId || ''
  );
  const [selectedDate, setSelectedDate] = useState(
    location.state?.date || new Date().toISOString().split('T')[0]
  );

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetch Teacher's classrooms
  useEffect(() => {
    classroomApi.getTeacherClassrooms()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.classrooms || [];
        setClassrooms(list);
        if (list.length > 0 && !selectedClassroomId) {
          setSelectedClassroomId(list[0]._id);
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch classrooms'));
  }, []);

  // 2. Fetch classroom attendance for selected date
  const loadRecords = async () => {
    if (!selectedClassroomId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setActionMessage('');
    try {
      const data = await attendanceApi.getClassroomAttendance(
        selectedClassroomId,
        selectedDate
      );
      const list = Array.isArray(data) ? data : data?.attendance || [];
      setRecords(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [selectedClassroomId, selectedDate]);

  // Update attendance record status via PUT /api/attendance/:attendanceId
  const handleToggleStatus = async (record) => {
    const nextStatus = record.status === 'present' ? 'absent' : 'present';
    setProcessingId(record._id);
    setActionMessage('');
    try {
      await attendanceApi.update(record._id, { status: nextStatus });
      // Update UI optimistically / immediately
      setRecords((prev) =>
        prev.map((r) => (r._id === record._id ? { ...r, status: nextStatus } : r))
      );
      setActionMessage(`Updated ${record.student?.name || 'student'} status to ${nextStatus}`);
    } catch (err) {
      setError(err.message || 'Failed to update attendance status');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete attendance record via DELETE /api/attendance/:attendanceId
  const handleDeleteRecord = async (recordId, studentName) => {
    if (!window.confirm(`Delete attendance record for ${studentName || 'this student'}?`)) {
      return;
    }
    setProcessingId(recordId);
    setActionMessage('');
    try {
      await attendanceApi.delete(recordId);
      // Remove from UI immediately
      setRecords((prev) => prev.filter((r) => r._id !== recordId));
      setActionMessage('Attendance record deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete attendance record');
    } finally {
      setProcessingId(null);
    }
  };

  const currentClassroom = classrooms.find((c) => c._id === selectedClassroomId);
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalStudents = records.length;
  const percentage =
    totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="attendance-result-page">
      <PageHeader
        title="Attendance Records"
        subtitle={`Session audit for ${currentClassroom?.name || 'Classroom'} • Date: ${selectedDate}`}
        backTo="/teacher/classes"
        backText="My Classrooms"
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
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate('/teacher/take-attendance', {
                  state: { classroomId: selectedClassroomId },
                })
              }
            >
              Take Attendance
            </Button>
          </div>
        }
      />

      {/* Filter / Selector Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Session:</span>
          </div>

          <div style={{ minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
            >
              {classrooms.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="date"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            color: 'var(--success-text)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="result-kpi-card">
          <span className="kpi-label">Recorded Students</span>
          <h3 className="kpi-val" style={{ color: 'var(--text-main)' }}>
            {totalStudents}
          </h3>
          <span className="kpi-sub">Entries on {selectedDate}</span>
        </div>

        <div className="result-kpi-card">
          <span className="kpi-label">Present</span>
          <h3 className="kpi-val" style={{ color: 'var(--success)' }}>
            {presentCount}
          </h3>
          <span className="kpi-sub">{percentage}% Present rate</span>
        </div>

        <div className="result-kpi-card">
          <span className="kpi-label">Absent</span>
          <h3 className="kpi-val" style={{ color: 'var(--danger)' }}>
            {absentCount}
          </h3>
          <span className="kpi-sub">Marked absent</span>
        </div>

        <div className="result-kpi-card">
          <span className="kpi-label">Subject</span>
          <h3
            className="kpi-val"
            style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '8px' }}
          >
            {currentClassroom?.subject || '—'}
          </h3>
          <span className="kpi-sub">
            Sec {currentClassroom?.section || '—'} • {currentClassroom?.semester || '—'}
          </span>
        </div>
      </div>

      {/* Verified Students Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Attendance Records Roster</h3>
            <p className="card-subtitle">
              Click status pill to toggle between Present and Absent, or remove a record.
            </p>
          </div>
          <span className="badge badge-primary">{records.length} Records</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary)" />
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state" style={{ padding: '36px 0' }}>
            <FileCheck2 size={44} color="var(--border)" />
            <h4>No Attendance Records Found</h4>
            <p>No attendance was marked for this classroom on {selectedDate}.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                navigate('/teacher/take-attendance', {
                  state: { classroomId: selectedClassroomId },
                })
              }
            >
              Take Attendance Now
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email / Roll No</th>
                  <th>Attendance Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        {rec.student?.name || 'Unknown Student'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontSize: '0.85rem' }}>
                          {rec.student?.email || '—'}
                        </span>
                        {rec.student?.rollNumber && (
                          <code style={{ display: 'block', fontSize: '0.75rem' }}>
                            {rec.student.rollNumber}
                          </code>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge
                        status={rec.status === 'present' ? 'Present' : 'Absent'}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <button
                          type="button"
                          className={`status-toggle-pill ${
                            rec.status === 'present' ? 'toggle-present' : 'toggle-absent'
                          }`}
                          disabled={processingId === rec._id}
                          onClick={() => handleToggleStatus(rec)}
                        >
                          {rec.status === 'present' ? (
                            <>
                              <CheckCircle2 size={13} /> Present (Toggle)
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Absent (Toggle)
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          title="Delete Record"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          disabled={processingId === rec._id}
                          onClick={() =>
                            handleDeleteRecord(rec._id, rec.student?.name)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/teacher/classes')}
          >
            Back to Classrooms
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceResult;
