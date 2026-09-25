import React from 'react';
import { BookOpen, User, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { STUDENT_SUBJECT_ATTENDANCE } from '../../data/dummyData';

const StudentClasses = () => {
  const classesData = [
    {
      ...STUDENT_SUBJECT_ATTENDANCE[0],
      room: 'LH-302 (Lecture Hall 3)',
      schedule: 'Mon, Wed, Fri • 10:00 AM - 11:00 AM',
      credits: 4,
      semester: 'Semester 4'
    },
    {
      ...STUDENT_SUBJECT_ATTENDANCE[1],
      room: 'LH-204 (Lecture Hall 2)',
      schedule: 'Tue, Thu • 12:00 PM - 01:30 PM',
      credits: 4,
      semester: 'Semester 4'
    },
    {
      ...STUDENT_SUBJECT_ATTENDANCE[2],
      room: 'LH-302 (Lecture Hall 3)',
      schedule: 'Mon, Wed • 11:00 AM - 12:00 PM',
      credits: 4,
      semester: 'Semester 4'
    },
    {
      ...STUDENT_SUBJECT_ATTENDANCE[3],
      room: 'LH-302 (Lecture Hall 3)',
      schedule: 'Wed, Fri • 09:00 AM - 10:00 AM',
      credits: 3,
      semester: 'Semester 4'
    },
    {
      ...STUDENT_SUBJECT_ATTENDANCE[4],
      room: 'LH-101 (Main Auditorium)',
      schedule: 'Tue, Thu • 02:00 PM - 03:30 PM',
      credits: 4,
      semester: 'Semester 4'
    }
  ];

  return (
    <div className="student-classes-page">
      <PageHeader
        title="My Enrolled Classes"
        subtitle="Current semester active subjects, scheduled lecture timings, and faculty details"
      />

      <div className="grid grid-cols-2" style={{ gap: '20px' }}>
        {classesData.map((cls) => (
          <div key={cls.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '6px' }}>
                  {cls.code} • {cls.credits} Credits
                </span>
                <h3 className="card-title">{cls.subject}</h3>
              </div>
              <StatusBadge status={cls.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <User size={16} color="var(--primary)" />
                <span>Instructor: <strong>{cls.faculty}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={16} color="var(--text-muted)" />
                <span>{cls.room}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Clock size={16} color="var(--text-muted)" />
                <span>{cls.schedule}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Class Attendance</span>
                <span style={{ fontWeight: 700, color: cls.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                  {cls.percentage}% ({cls.present}/{cls.total} Classes)
                </span>
              </div>
              <div className="subject-progress-track">
                <div
                  className={`subject-progress-bar ${
                    cls.percentage >= 80 ? 'fill-green' : cls.percentage >= 75 ? 'fill-amber' : 'fill-red'
                  }`}
                  style={{ width: `${cls.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentClasses;
