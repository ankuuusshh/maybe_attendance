import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Camera,
  Plus,
  Loader2,
  AlertCircle,
  FolderOpen,
  Copy,
  Check,
  Hash,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { classroomApi } from '../../services/api';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await classroomApi.getTeacherClassrooms();
        setClassrooms(Array.isArray(data) ? data : (data?.classrooms || []));
      } catch (err) {
        setError(err.message || 'Failed to load classrooms');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="teacher-classes-page">
      <PageHeader
        title="My Classrooms"
        subtitle="Manage assigned sections, student enrollment, and scheduled lectures"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/teacher/create-classroom')}
          >
            Create Classroom
          </Button>
        }
      />

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        </div>
      )}

      {error && !loading && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && classrooms.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <FolderOpen size={48} color="var(--border)" />
            <h4>No Classrooms Yet</h4>
            <p>
              You haven't created any classrooms yet. Click "Create Classroom" to get
              started.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate('/teacher/create-classroom')}
            >
              Create First Classroom
            </Button>
          </div>
        </div>
      )}

      {!loading && classrooms.length > 0 && (
        <div className="grid grid-cols-2" style={{ gap: '22px' }}>
          {classrooms.map((cls) => (
            <div
              key={cls._id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className="card-header" style={{ marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
                    {cls.semester} • Sec {cls.section}
                  </span>
                  <h3 className="card-title">{cls.name}</h3>
                </div>
                <span className="badge badge-neutral">
                  {cls.students?.length ?? 0} Students
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  fontSize: '0.875rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <BookOpen size={16} color="var(--primary)" />
                  <span>
                    Subject: <strong>{cls.subject}</strong>
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Users size={16} color="var(--text-muted)" />
                  <span>
                    Enrolled: <strong>{cls.students?.length ?? 0} Students</strong>
                  </span>
                </div>

                {/* Classroom ID / Join Code */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    marginTop: '4px',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Hash size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          color: 'var(--text-muted)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Classroom ID / Join Code
                      </span>
                      <code
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          fontFamily: 'var(--font-mono)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={cls._id}
                      >
                        {cls._id}
                      </code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(cls._id)}
                    title={copiedId === cls._id ? 'Copied to clipboard!' : 'Copy Classroom ID'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: copiedId === cls._id ? 'var(--success-light)' : '#ffffff',
                      color: copiedId === cls._id ? 'var(--success-text)' : 'var(--text-main)',
                      border: `1px solid ${
                        copiedId === cls._id ? 'var(--success-border)' : 'var(--border)'
                      }`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    {copiedId === cls._id ? (
                      <>
                        <Check size={12} color="var(--success)" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  icon={Camera}
                  onClick={() =>
                    navigate('/teacher/take-attendance', {
                      state: { classroomId: cls._id, classroomName: cls.name },
                    })
                  }
                >
                  Take Attendance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Users}
                  onClick={() =>
                    navigate('/teacher/attendance-result', {
                      state: { classroomId: cls._id, classroomName: cls.name },
                    })
                  }
                >
                  View Records
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
