import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { classroomApi } from '../../services/api';

const CreateClassroom = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    semester: '4th Semester',
    section: 'A',
  });

  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await classroomApi.create({
        name: formData.name,
        subject: formData.subject,
        semester: formData.semester,
        section: formData.section,
      });
      setSuccessMessage(true);
      setTimeout(() => navigate('/teacher/classes'), 1400);
    } catch (err) {
      setError(err.message || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-classroom-page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <PageHeader
        title="Create New Classroom"
        subtitle="Configure a classroom section and link course curriculum"
        backTo="/teacher/classes"
      />

      <div className="card">
        {successMessage ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <CheckCircle2 size={52} color="var(--success)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              Classroom Created Successfully!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <strong>{formData.name || 'New Class'}</strong> ({formData.subject}) has been
              initialized. Redirecting to classes…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-banner" style={{ marginBottom: '20px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Class Name / Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CSE-4A or Data Structures Section A"
                value={formData.name}
                onChange={handleChange('name')}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures, DBMS, Operating Systems"
                value={formData.subject}
                onChange={handleChange('subject')}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Section *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A, B, C"
                  value={formData.section}
                  onChange={handleChange('section')}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Semester *</label>
                <select
                  value={formData.semester}
                  onChange={handleChange('semester')}
                  className="form-select"
                >
                  {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((s) => (
                    <option key={s} value={`${s} Semester`}>
                      {s} Semester
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/teacher/classes')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={loading}>
                Create Classroom
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateClassroom;
