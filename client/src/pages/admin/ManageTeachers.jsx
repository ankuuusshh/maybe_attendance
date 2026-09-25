import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, BookOpen, Briefcase } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { INITIAL_TEACHERS } from '../../data/dummyData';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    email: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    phone: '+91 98000 00000',
    assignedSubjects: ['Data Structures']
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      empId: `EMP-CS-${110 + teachers.length}`,
      email: '',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      phone: '+91 98000 00000',
      assignedSubjects: ['Operating Systems']
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTeacher(t);
    setFormData({
      name: t.name,
      empId: t.empId,
      email: t.email,
      department: t.department,
      designation: t.designation,
      phone: t.phone,
      assignedSubjects: t.assignedSubjects
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (t) => {
    setSelectedTeacher(t);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const newTeacher = {
      id: `t_${Date.now()}`,
      ...formData,
      assignedClasses: ['CSE-4A'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };
    setTeachers([newTeacher, ...teachers]);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setTeachers(
      teachers.map((t) => (t.id === selectedTeacher.id ? { ...t, ...formData } : t))
    );
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
    setIsDeleteOpen(false);
  };

  const filteredTeachers = deptFilter === 'ALL'
    ? teachers
    : teachers.filter((t) => t.department === deptFilter);

  const columns = [
    {
      header: 'Faculty Member',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.avatar}
            alt={row.name}
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <span style={{ fontWeight: 700, display: 'block' }}>{row.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Employee ID',
      render: (row) => <code>{row.empId}</code>
    },
    {
      header: 'Department & Rank',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{row.department}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{row.designation}</span>
        </div>
      )
    },
    {
      header: 'Assigned Subjects',
      render: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {row.assignedSubjects.map((sub, i) => (
            <span key={i} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              {sub}
            </span>
          ))}
        </div>
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
            title="Edit faculty"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            style={{ color: 'var(--danger)' }}
            onClick={() => handleOpenDelete(row)}
            title="Delete faculty"
          />
        </div>
      )
    }
  ];

  return (
    <div className="manage-teachers-page">
      <PageHeader
        title="Faculty & Instructor Directory"
        subtitle="Manage academic staff, faculty allocations, course assignments, and permissions"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Faculty Member
          </Button>
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={filteredTeachers}
          searchKeys={['name', 'empId', 'department', 'designation']}
          searchPlaceholder="Search faculty by name, employee ID, or department..."
          filterSlot={
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '220px' }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          }
        />
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Faculty Member"
        subtitle="Register new teaching staff into the college portal"
      >
        <form onSubmit={handleSaveAdd}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Ramesh Gupta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                required
                value={formData.empId}
                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                required
                placeholder="faculty@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Faculty</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Faculty Record"
        subtitle={`Updating information for ${selectedTeacher?.name}`}
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

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

      {/* Delete Teacher Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Faculty Removal"
        maxWidth="440px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to remove <strong>{selectedTeacher?.name}</strong> from the faculty directory?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageTeachers;
