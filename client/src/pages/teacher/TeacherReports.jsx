import React, { useState } from 'react';
import { Download, Filter, BarChart3, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { INITIAL_STUDENTS } from '../../data/dummyData';

const TeacherReports = () => {
  const [selectedClass, setSelectedClass] = useState('CSE-4A');
  const [timeRange, setTimeRange] = useState('month');

  // Defaulters below 75%
  const defaulters = INITIAL_STUDENTS.filter((s) => s.overallAttendance < 75);

  const columns = [
    {
      header: 'Student Name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={row.avatar}
            alt={row.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontWeight: 700 }}>{row.name}</span>
        </div>
      )
    },
    {
      header: 'Roll Number',
      render: (row) => <code>{row.rollNo}</code>
    },
    {
      header: 'Department & Sem',
      render: (row) => `${row.department} (${row.semester})`
    },
    {
      header: 'Face Registered',
      render: (row) => (
        <StatusBadge status={row.faceRegistered ? 'Registered' : 'Not Completed'} size="sm" />
      )
    },
    {
      header: 'Attendance %',
      render: (row) => (
        <strong style={{ color: 'var(--danger)' }}>
          {row.overallAttendance}%
        </strong>
      )
    },
    {
      header: 'Status',
      render: () => <StatusBadge status="Low" text="Defaulter (<75%)" />
    }
  ];

  return (
    <div className="teacher-reports-page">
      <PageHeader
        title="Attendance Analytics & Reports"
        subtitle="Departmental attendance logs, aggregate statistics, and defaulter tracking"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert('Attendance report exported successfully (Simulation)')}
          >
            Export Comprehensive Report
          </Button>
        }
      />

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Average Attendance"
          value="87.6%"
          subtitle="Across all sections"
          icon={TrendingUp}
          color="primary"
          trend="+2.1%"
          trendType="up"
        />
        <StatCard
          title="Classes Conducted"
          value="48"
          subtitle="This academic month"
          icon={BarChart3}
          color="purple"
        />
        <StatCard
          title="Total Active Students"
          value="168"
          subtitle="Assigned cohort"
          icon={Users}
          color="success"
        />
        <StatCard
          title="Defaulters (<75%)"
          value={defaulters.length}
          subtitle="Require intervention"
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter By:</span>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="CSE-4A">CSE-4A (Data Structures)</option>
            <option value="CSE-4B">CSE-4B (DBMS)</option>
            <option value="IT-4A">IT-4A (Networks)</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Current Week</option>
            <option value="month">Current Month</option>
            <option value="semester">Entire Semester</option>
          </select>
        </div>
      </div>

      {/* Defaulters Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              Attendance Defaulters List (&lt; 75%)
            </h3>
            <p className="card-subtitle">
              Students falling below the university requirement eligible for notice issuance
            </p>
          </div>
          <span className="badge badge-danger">{defaulters.length} Students Flagged</span>
        </div>

        <DataTable
          columns={columns}
          data={defaulters}
          searchKeys={['name', 'rollNo', 'department']}
          searchPlaceholder="Search defaulters by name or roll number..."
        />
      </div>
    </div>
  );
};

export default TeacherReports;
