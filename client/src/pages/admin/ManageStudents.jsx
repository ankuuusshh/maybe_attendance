import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ScanFace, Check, GraduationCap } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { INITIAL_STUDENTS } from '../../data/dummyData';

const ManageStudents = () => {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    department: 'Computer Science & Engineering',
    semester: '4th Semester',
    section: 'A',
    faceRegistered: true
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      rollNo: `241051290${students.length + 16}`,
      email: '',
      department: 'Computer Science & Engineering',
      semester: '4th Semester',
      section: 'A',
      faceRegistered: true
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      email: student.email,
      department: student.department,
      semester: student.semester,
      section: student.section,
      faceRegistered: student.faceRegistered
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const newStudent = {
      id: `s_${Date.now()}`,
      ...formData,
      overallAttendance: 90.0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };
    setStudents([newStudent, ...students]);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setStudents(
      students.map((s) => (s.id === selectedStudent.id ? { ...s, ...formData } : s))
    );
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    setStudents(students.filter((s) => s.id !== selectedStudent.id));
    setIsDeleteOpen(false);
  };

  const filteredStudents = departmentFilter === 'ALL'
    ? students
    : students.filter((s) => s.department === departmentFilter);

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.avatar}
            alt={row.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <span style={{ fontWeight: 700, display: 'block' }}>{row.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Roll Number',
      render: (row) => <code>{row.rollNo}</code>
    },
    {
      header: 'Department & Class',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{row.department}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.semester} • Sec {row.section}</span>
        </div>
      )
    },
    {
      header: 'Biometric Status',
      render: (row) => (
        <StatusBadge
          status={row.faceRegistered ? 'Registered' : 'Not Completed'}
          text={row.faceRegistered ? 'Face Enrolled' : 'Pending Capture'}
          size="sm"
        />
      )
    },
    {
      header: 'Attendance %',
      render: (row) => (
        <strong style={{ color: row.overallAttendance >= 75 ? 'var(--success)' : 'var(--danger)' }}>
          {row.overallAttendance}%
        </strong>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => handleOpenEdit(row)}
            title="Edit student"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            style={{ color: 'var(--danger)' }}
            onClick={() => handleOpenDelete(row)}
            title="Delete student"
          />
        </div>
      )
    }
  ];

  return (
    <div className="manage-students-page">
      <PageHeader
        title="Student Directory & Biometric Registry"
        subtitle="Manage enrolled undergraduate & graduate students, academic programs, and face vectors"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Student
          </Button>
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={filteredStudents}
          searchKeys={['name', 'rollNo', 'email', 'department']}
          searchPlaceholder="Search by name, roll number, or department..."
          filterSlot={
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '220px' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          }
        />
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Enrolled Student"
        subtitle="Register new student credentials into the campus directory"
      >
        <form onSubmit={handleSaveAdd}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aditi Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institutional Email *</label>
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Student</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Information"
        subtitle={`Updating records for ${selectedStudent?.name}`}
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Student Deletion"
        subtitle="This action will delete the student and their associated facial recognition encodings."
        maxWidth="450px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to remove <strong>{selectedStudent?.name}</strong> (Roll: {selectedStudent?.rollNo})?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageStudents;
