import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Users, MapPin } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { INITIAL_CLASSROOMS } from '../../data/dummyData';

const ManageClassrooms = () => {
  const [classrooms, setClassrooms] = useState(INITIAL_CLASSROOMS);
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    department: 'Computer Science & Engineering',
    semester: '4th Semester',
    section: 'A',
    academicYear: '2025-2026',
    room: 'LH-302',
    totalStudents: 42,
    teacher: 'Prof. Dr. Rajesh Sharma'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      displayName: '',
      department: 'Computer Science & Engineering',
      semester: '4th Semester',
      section: 'A',
      academicYear: '2025-2026',
      room: 'LH-302',
      totalStudents: 40,
      teacher: 'Prof. Dr. Rajesh Sharma'
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setSelectedClass(cls);
    setFormData({ ...cls });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cls) => {
    setSelectedClass(cls);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const newClass = {
      id: `c_${Date.now()}`,
      ...formData
    };
    setClassrooms([...classrooms, newClass]);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setClassrooms(classrooms.map((c) => (c.id === selectedClass.id ? { ...formData } : c)));
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    setClassrooms(classrooms.filter((c) => c.id !== selectedClass.id));
    setIsDeleteOpen(false);
  };

  const filtered = deptFilter === 'ALL'
    ? classrooms
    : classrooms.filter((c) => c.department === deptFilter);

  const columns = [
    {
      header: 'Classroom / Section',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, display: 'block' }}>{row.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.displayName}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Semester & Section',
      render: (row) => `${row.semester} • Sec ${row.section}`
    },
    {
      header: 'Hall / Lab',
      render: (row) => <code>{row.room}</code>
    },
    {
      header: 'Assigned Faculty',
      accessor: 'teacher'
    },
    {
      header: 'Capacity',
      render: (row) => <strong>{row.totalStudents} Students</strong>
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
            title="Edit classroom"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            style={{ color: 'var(--danger)' }}
            onClick={() => handleOpenDelete(row)}
            title="Delete classroom"
          />
        </div>
      )
    }
  ];

  return (
    <div className="manage-classrooms-page">
      <PageHeader
        title="Classroom & Section Management"
        subtitle="Configure physical lecture rooms, cohort allotments, and primary instructors"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Classroom
          </Button>
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={filtered}
          searchKeys={['name', 'displayName', 'department', 'room', 'teacher']}
          searchPlaceholder="Search classrooms by code, hall, or faculty..."
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
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          }
        />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Classroom"
        subtitle="Define new lecture group and student section"
      >
        <form onSubmit={handleSaveAdd}>
          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Class Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CSE-5A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science Sec A"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="form-input"
              />
            </div>
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

          <div className="grid grid-cols-3" style={{ gap: '14px' }}>
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
            <div className="form-group">
              <label className="form-label">Room / Hall</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Classroom</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Classroom Configuration"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label">Class Code</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Hall</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Classroom Removal"
        maxWidth="440px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to remove classroom <strong>{selectedClass?.name}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageClassrooms;
