import React, { useState } from 'react';
import { Download, Filter, BarChart3, TrendingUp, AlertTriangle, Users, Building, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { INITIAL_STUDENTS } from '../../data/dummyData';

const AdminReports = () => {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTerm, setSelectedTerm] = useState('2025-2026 Spring');

  const deptSummaries = [
    { department: 'Computer Science & Engineering', totalStudents: 480, avgAttendance: 91.2, defaulters: 12, compliance: '97.5%' },
    { department: 'Information Technology', totalStudents: 320, avgAttendance: 88.5, defaulters: 16, compliance: '95.0%' },
    { department: 'Electronics & Communication', totalStudents: 260, avgAttendance: 82.4, defaulters: 24, compliance: '90.7%' },
    { department: 'Applied Sciences (1st Year)', totalStudents: 190, avgAttendance: 76.8, defaulters: 28, compliance: '85.2%' }
  ];

  const columns = [
    {
      header: 'Department',
      render: (row) => <strong>{row.department}</strong>
    },
    {
      header: 'Total Students',
      render: (row) => `${row.totalStudents} Students`
    },
    {
      header: 'Average Attendance',
      render: (row) => (
        <strong style={{ color: row.avgAttendance >= 85 ? 'var(--success)' : 'var(--warning)' }}>
          {row.avgAttendance}%
        </strong>
      )
    },
    {
      header: 'Defaulters (<75%)',
      render: (row) => <span className="badge badge-danger">{row.defaulters} Flagged</span>
    },
    {
      header: 'Biometric Compliance',
      render: (row) => <span className="badge badge-info">{row.compliance}</span>
    }
  ];

  return (
    <div className="admin-reports-page">
      <PageHeader
        title="Institution-Wide Attendance Reports"
        subtitle="Executive reporting, accreditation compliance audits, and university-level metrics"
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => alert('Official accreditation audit report exported as PDF (Simulation)')}
            >
              Export PDF Audit
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => alert('Raw attendance dataset exported as CSV (Simulation)')}
            >
              Export CSV Dataset
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Campus Attendance"
          value="89.2%"
          subtitle="All departments combined"
          icon={TrendingUp}
          color="primary"
          trend="+1.4% MoM"
          trendType="up"
        />
        <StatCard
          title="Lectures Monitored"
          value="1,420"
          subtitle="AI verified sessions"
          icon={BarChart3}
          color="purple"
        />
        <StatCard
          title="Campus Defaulters"
          value="80"
          subtitle="6.4% of student body"
          icon={AlertTriangle}
          color="danger"
        />
        <StatCard
          title="Biometric Accuracy"
          value="96.2%"
          subtitle="Average cosine confidence"
          icon={ShieldCheck}
          color="success"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter By:</span>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '220px' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science & Engineering</option>
            <option value="IT">Information Technology</option>
            <option value="ECE">Electronics & Communication</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="2025-2026 Spring">Spring Session 2025-2026</option>
            <option value="2024-2025 Autumn">Autumn Session 2024-2025</option>
          </select>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Departmental Summary & Accreditation Compliance</h3>
            <p className="card-subtitle">Aggregated semester audit for statutory university reporting</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={deptSummaries}
          searchable={false}
          pagination={false}
        />
      </div>

      {/* Future AI Pipeline Architecture Callout */}
      <div className="card" style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <ShieldCheck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
              Statutory AI Attendance Verification Note
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All attendance records generated by the AI Vision Engine are cryptographically verifiable. When connected to the production Node.js and FastAPI backend, each attendance event records timestamp, classroom camera snapshot hash, and 128-d face embedding distances for dispute resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
