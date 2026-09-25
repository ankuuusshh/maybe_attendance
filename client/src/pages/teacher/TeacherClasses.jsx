import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Camera, Plus, Eye, UserCheck, MapPin, Sparkles } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { INITIAL_CLASSROOMS, INITIAL_STUDENTS } from '../../data/dummyData';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState(INITIAL_CLASSROOMS);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleManageStudents = (cls) => {
    setSelectedClass(cls);
    setRosterModalOpen(true);
  };

  const handleViewClass = (cls) => {
    setSelectedClass(cls);
    setDetailModalOpen(true);
  };

  return (
    <div className="teacher-classes-page">
      <PageHeader
        title="My Classrooms"
        subtitle="Manage assigned sections, student enrollment lists, and scheduled lectures"
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

      <div className="grid grid-cols-2" style={{ gap: '22px' }}>
        {classrooms.map((cls) => (
          <div key={cls.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
                  {cls.semester} • {cls.section ? `Sec ${cls.section}` : ''}
                </span>
                <h3 className="card-title">{cls.name} - {cls.displayName}</h3>
              </div>
              <span className="badge badge-neutral">{cls.academicYear}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <BookOpen size={16} color="var(--primary)" />
                <span>Department: <strong>{cls.department}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Users size={16} color="var(--text-muted)" />
                <span>Enrolled: <strong>{cls.totalStudents} Students</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={16} color="var(--text-muted)" />
                <span>Assigned Hall: <strong>{cls.room}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <UserCheck size={16} color="var(--text-muted)" />
                <span>Instructor: {cls.teacher}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={Eye}
                onClick={() => handleViewClass(cls)}
              >
                View
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Users}
                onClick={() => handleManageStudents(cls)}
              >
                Manage Students
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Camera}
                onClick={() => navigate('/teacher/take-attendance')}
              >
                Take Attendance
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Roster / Students Modal */}
      <Modal
        isOpen={rosterModalOpen}
        onClose={() => setRosterModalOpen(false)}
        title={`Student Roster - ${selectedClass?.name || ''}`}
        subtitle={`Total ${selectedClass?.totalStudents || 42} enrolled students with biometric status`}
        maxWidth="680px"
      >
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Face Registered</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_STUDENTS.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={student.avatar}
                        alt={student.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 600 }}>{student.name}</span>
                    </div>
                  </td>
                  <td><code>{student.rollNo}</code></td>
                  <td>
                    <StatusBadge
                      status={student.faceRegistered ? 'Registered' : 'Not Completed'}
                      size="sm"
                    />
                  </td>
                  <td>
                    <strong style={{ color: student.overallAttendance >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {student.overallAttendance}%
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Classroom Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedClass?.displayName}
        subtitle="Classroom configuration and academic parameters"
      >
        {selectedClass && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Class Code</span>
              <p style={{ fontWeight: 600 }}>{selectedClass.name}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
              <p style={{ fontWeight: 600 }}>{selectedClass.department}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Academic Year & Semester</span>
              <p style={{ fontWeight: 600 }}>{selectedClass.academicYear} • {selectedClass.semester}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Hall / Lab</span>
              <p style={{ fontWeight: 600 }}>{selectedClass.room}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherClasses;
