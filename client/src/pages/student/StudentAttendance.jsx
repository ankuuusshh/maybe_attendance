import React, { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, Filter, Loader2, AlertCircle, CalendarCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import { attendanceApi, classroomApi } from '../../services/api';

const StudentAttendance = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch classrooms for the filter dropdown
  useEffect(() => {
    classroomApi.getStudentClassrooms()
      .then((data) => setClassrooms(Array.isArray(data) ? data : (data?.classrooms || [])))
      .catch(() => {});
  }, []);

  // 2. Fetch attendance logs (either all or classroom-specific)
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        if (selectedClassroom !== 'ALL') {
          data = await attendanceApi.getStudentAttendanceForClassroom(selectedClassroom);
        } else {
          data = await attendanceApi.getStudentAttendance();
        }
        const records = Array.isArray(data) ? data : (data?.attendance || []);
        setLogs(records);
      } catch (err) {
        setError(err.message || 'Failed to fetch attendance history');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedClassroom]);

  // Client-side filtering by status and date
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchStatus =
        selectedStatus === 'ALL' ||
        item.status?.toLowerCase() === selectedStatus.toLowerCase();

      const itemDateStr = item.date
        ? new Date(item.date).toISOString().split('T')[0]
        : '';
      const matchDate = !dateFilter || itemDateStr === dateFilter;

      return matchStatus && matchDate;
    });
  }, [logs, selectedStatus, dateFilter]);

  const totalLogs = filteredLogs.length;
  const presentCount = filteredLogs.filter(
    (l) => l.status?.toLowerCase() === 'present'
  ).length;
  const percentage = totalLogs > 0 ? ((presentCount / totalLogs) * 100).toFixed(1) : 0;

  const columns = [
    {
      header: 'Date & Time',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>
            {row.date ? new Date(row.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.date ? new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Classroom',
      render: (row) => (
        <div>
          <strong>{row.classroom?.name || 'Classroom'}</strong>
          {row.classroom?.section && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              Sec {row.classroom.section} • {row.classroom.semester}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Subject',
      render: (row) => <span>{row.classroom?.subject || '—'}</span>,
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status?.toLowerCase() === 'present' ? 'Present' : 'Absent'}
        />
      ),
    },
  ];

  return (
    <div className="student-attendance-page">
      <PageHeader
        title="Attendance History"
        subtitle="Complete chronological audit log of recorded class attendances"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert('Attendance statement export simulation')}
          >
            Export Statement
          </Button>
        }
      />

      {error && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Attendance Ratio
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                marginTop: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                }}
              >
                {percentage}%
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ({presentCount} Present / {totalLogs} Total Recorded)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <span className="badge badge-safe">Present: {presentCount}</span>
            <span className="badge badge-danger">
              Absent: {totalLogs - presentCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
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
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters:</span>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
            >
              <option value="ALL">All Enrolled Classrooms</option>
              {classrooms.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="date"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(selectedClassroom !== 'ALL' || selectedStatus !== 'ALL' || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedClassroom('ALL');
                setSelectedStatus('ALL');
                setDateFilter('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary)" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={44} color="var(--border)" />
            <h4>No Attendance Records Found</h4>
            <p>There are no attendance records matching your selected filters.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredLogs}
            searchKeys={['status', 'classroom.name', 'classroom.subject']}
            searchPlaceholder="Search by status or classroom name..."
            emptyMessage="No attendance logs found matching search."
          />
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
