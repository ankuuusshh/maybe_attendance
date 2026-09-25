import React, { useState, useMemo } from 'react';
import { Download, Calendar, ShieldCheck, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import { STUDENT_ATTENDANCE_LOGS } from '../../data/dummyData';

const StudentAttendance = () => {
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const subjects = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Mathematics'];

  const filteredLogs = useMemo(() => {
    return STUDENT_ATTENDANCE_LOGS.filter((item) => {
      const matchSub = selectedSubject === 'ALL' || item.subject === selectedSubject;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchDate = !dateFilter || item.date === dateFilter;
      return matchSub && matchStatus && matchDate;
    });
  }, [selectedSubject, selectedStatus, dateFilter]);

  const totalLogs = filteredLogs.length;
  const presentCount = filteredLogs.filter((l) => l.status === 'Present').length;
  const percentage = totalLogs > 0 ? ((presentCount / totalLogs) * 100).toFixed(1) : 0;

  const columns = [
    {
      header: 'Date & Time',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{row.date}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.time}</span>
        </div>
      )
    },
    {
      header: 'Subject',
      render: (row) => <strong>{row.subject}</strong>
    },
    {
      header: 'Class / Hall',
      accessor: 'class'
    },
    {
      header: 'Instructor',
      accessor: 'faculty'
    },
    {
      header: 'Verification Method',
      render: (row) => (
        <span className="verification-badge">
          <ShieldCheck size={14} color="var(--primary)" />
          {row.method}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="student-attendance-page">
      <PageHeader
        title="Attendance History"
        subtitle="Complete chronological audit log of automated and recorded class attendances"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert('Attendance statement exported as PDF (Simulation)')}
          >
            Export Statement
          </Button>
        }
      />

      {/* Summary KPI Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Filtered Attendance Ratio
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {percentage}%
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ({presentCount} Present / {totalLogs} Total Recorded)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <span className="badge badge-safe">Present: {presentCount}</span>
            <span className="badge badge-danger">Absent: {totalLogs - presentCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters:</span>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
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
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
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

          {(selectedSubject !== 'ALL' || selectedStatus !== 'ALL' || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSubject('ALL');
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
        <DataTable
          columns={columns}
          data={filteredLogs}
          searchKeys={['subject', 'faculty', 'class', 'status']}
          searchPlaceholder="Search by subject, instructor, or date..."
          emptyMessage="No attendance logs found matching the selected filters."
        />
      </div>
    </div>
  );
};

export default StudentAttendance;
