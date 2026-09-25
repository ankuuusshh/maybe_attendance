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
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { classroomApi } from '../../services/api';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
