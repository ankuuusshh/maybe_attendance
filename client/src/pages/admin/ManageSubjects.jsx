import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Library, BookOpen } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { INITIAL_SUBJECTS } from '../../data/dummyData';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Science & Engineering',
    credits: 4,
    semester: '4th Semester',
    teacher: 'Prof. Dr. Rajesh Sharma'
  });

  const handleOpenAdd = () => {
    setFormData({
      code: `CS${405 + subjects.length}`,
      name: '',
      department: 'Computer Science & Engineering',
      credits: 4,
      semester: '4th Semester',
      teacher: 'Prof. Dr. Rajesh Sharma'
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSubject(sub);
    setFormData({ ...sub });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (sub) => {
    setSelectedSubject(sub);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const newSub = {
      id: `sub_${Date.now()}`,
      ...formData
    };
    setSubjects([...subjects, newSub]);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setSubjects(subjects.map((s) => (s.id === selectedSubject.id ? { ...formData } : s)));
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    setSubjects(subjects.filter((s) => s.id !== selectedSubject.id));
    setIsDeleteOpen(false);
  };

  const filtered = deptFilter === 'ALL'
    ? subjects
    : subjects.filter((s) => s.department === deptFilter);

  const columns = [
    {
      header: 'Subject Code',
      render: (row) => <code>{row.code}</code>
    },
    {
      header: 'Subject Name',
      render: (row) => <strong>{row.name}</strong>
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Credits',
      render: (row) => <span className="badge badge-info">{row.credits} Credits</span>
    },
    {
      header: 'Semester',
      accessor: 'semester'
    },
    {
      header: 'Primary Instructor',
      accessor: 'teacher'
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
            title="Edit subject"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            style={{ color: 'var(--danger)' }}
            onClick={() => handleOpenDelete(row)}
            title="Delete subject"
          />
        </div>
      )
    }
  ];

  return (
    <div className="manage-subjects-page">
      <PageHeader
        title="Curriculum & Subjects Management"
        subtitle="Manage academic courses, credit weightages, semesters, and lead instructors"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Subject
          </Button>
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={filtered}
          searchKeys={['code', 'name', 'department', 'teacher']}
          searchPlaceholder="Search subjects by code, title, or instructor..."
          filterSlot={
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '220px' }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Applied Sciences">Applied Sciences</option>
            </select>
          }
        />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Course / Subject"
        subtitle="Introduce new syllabus curriculum module"
      >
        <form onSubmit={handleSaveAdd}>
          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Credits *</label>
              <input
                type="number"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence & Neural Networks"
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
              <option value="Applied Sciences">Applied Sciences</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Instructor</label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Subject</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Subject Information"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructor</label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
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
        title="Confirm Subject Deletion"
        maxWidth="440px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to remove <strong>{selectedSubject?.name}</strong> ({selectedSubject?.code})?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
