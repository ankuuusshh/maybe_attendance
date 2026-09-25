import React, { useState, useEffect } from 'react';
import { BookOpen, User, Loader2, AlertCircle, FolderOpen, Plus, CheckCircle2, Hash } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { classroomApi } from '../../services/api';

const StudentClasses = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Join classroom
  const [joinCode, setJoinCode] = useState('');
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const load = async () => {
    try {
      const data = await classroomApi.getStudentClassrooms();
      setClassrooms(Array.isArray(data) ? data : (data?.classrooms || []));
    } catch (err) {
      setError(err.message || 'Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoining(true);
    try {
      await classroomApi.join(joinCode.trim());
      setSuccessBanner('Successfully joined the classroom!');
      setTimeout(() => setSuccessBanner(''), 4000);
      setJoinModalOpen(false);
      setJoinCode('');
      // Reload classrooms
      setLoading(true);
      await load();
    } catch (err) {
      setJoinError(err.message || 'Invalid classroom ID or already joined');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="student-classes-page">
      <PageHeader
        title="My Enrolled Classes"
        subtitle="Current semester active subjects and faculty details"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setJoinModalOpen(true)}
          >
            Join Classroom
          </Button>
        }
      />

      {successBanner && (
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
          <span>{successBanner}</span>
        </div>
      )}

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
            <h4>No Classes Enrolled</h4>
            <p>You haven't joined any classrooms yet. Ask your teacher for the Classroom ID.</p>
            <Button variant="primary" icon={Plus} onClick={() => setJoinModalOpen(true)}>
              Join Classroom
            </Button>
          </div>
        </div>
      )}

      {!loading && classrooms.length > 0 && (
        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
          {classrooms.map((cls) => (
            <div
              key={cls._id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className="card-header" style={{ marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '6px' }}>
                    {cls.semester} • Sec {cls.section}
                  </span>
                  <h3 className="card-title">{cls.name}</h3>
                </div>
                <StatusBadge status="Safe" />
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

                {cls.teacher && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <User size={16} color="var(--text-muted)" />
                    <span>
                      Instructor:{' '}
                      <strong>{cls.teacher?.name || 'Teacher'}</strong>
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-app)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '4px',
                  }}
                >
                  <Hash size={13} color="var(--primary)" />
                  <span>
                    Classroom ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{cls._id}</code>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Classroom Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => { setJoinModalOpen(false); setJoinError(''); setJoinCode(''); }}
        title="Join a Classroom"
        subtitle="Enter the Classroom ID provided by your teacher"
        maxWidth="420px"
      >
        <form onSubmit={handleJoin}>
          {joinError && (
            <div className="error-banner" style={{ marginBottom: '16px' }}>
              <AlertCircle size={15} />
              <span>{joinError}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Classroom ID</label>
            <input
              type="text"
              required
              placeholder="Paste the classroom ID here"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => { setJoinModalOpen(false); setJoinError(''); setJoinCode(''); }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={joining}>
              Join Classroom
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentClasses;
