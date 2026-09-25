import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const CreateClassroom = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    className: '',
    subject: 'Data Structures',
    semester: '4th Semester',
    section: 'A',
    academicYear: '2025-2026',
    room: 'LH-302',
    capacity: '45'
  });

  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/teacher/classes');
      }, 1200);
    }, 600);
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
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              Classroom Created Successfully!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <strong>{formData.className || 'New Class'}</strong> ({formData.subject}) has been initialized. Redirecting to classes...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Class Identifier / Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CSE-4A or CS-2026"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-select"
                >
                  <option value="Data Structures">Data Structures (CS401)</option>
                  <option value="DBMS">DBMS (CS402)</option>
                  <option value="Operating Systems">Operating Systems (CS403)</option>
                  <option value="Computer Networks">Computer Networks (CS404)</option>
                  <option value="Mathematics IV">Mathematics IV (MA401)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester *</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="form-select"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Section *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section A"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025-2026"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Assigned Hall / Lab</label>
                <input
                  type="text"
                  placeholder="e.g. LH-302 or Lab 4"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Capacity</label>
                <input
                  type="number"
                  placeholder="e.g. 45"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/teacher/classes')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
              >
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
