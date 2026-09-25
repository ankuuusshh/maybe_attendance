import React, { useState } from 'react';
import { User, Mail, Phone, GraduationCap, Building2, Calendar, ScanFace, Check, Edit2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const StudentProfile = () => {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Ankush Raj',
    rollNo: user?.rollNo || '24105129015',
    email: user?.email || 'ankush.raj@college.edu',
    phone: '+91 98765 43210',
    department: user?.department || 'Computer Science & Engineering',
    semester: user?.semester || '4th Semester',
    section: user?.section || 'A',
    admissionYear: '2023',
    bloodGroup: 'O+',
    guardianName: 'Dr. S. K. Raj',
    guardianContact: '+91 98765 00000',
    address: 'Campus Hostel Block 4, Room 212, Tech University'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditOpen(false);
  };

  return (
    <div className="student-profile-page">
      <PageHeader
        title="Student Profile"
        subtitle="Manage personal, academic, and biometric credentials"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditOpen(true)}
          >
            Edit Profile
          </Button>
        }
      />

      <div className="grid grid-cols-3" style={{ gap: '24px' }}>
        {/* Profile Card Left */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"}
              alt={profileData.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--primary-light)',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: 'var(--success)',
                color: '#fff',
                borderRadius: '50%',
                padding: '4px',
                border: '2px solid #fff'
              }}
              title="Verified Face Recognition"
            >
              <ScanFace size={16} />
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>{profileData.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            Roll No: <strong>{profileData.rollNo}</strong>
          </p>

          <StatusBadge status="Registered" text="Biometrics Verified" />

          <div style={{ width: '100%', borderTop: '1px solid var(--border-light)', marginTop: '24px', paddingTop: '18px', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span>{profileData.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span>{profileData.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={16} color="var(--text-muted)" />
              <span>B.Tech Computer Science</span>
            </div>
          </div>
        </div>

        {/* Details Grid Right */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Academic & Institutional Details</h3>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '18px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.department}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Semester & Section</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.semester} - Section {profileData.section}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Admission Year</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.admissionYear}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Blood Group</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.bloodGroup}</p>
            </div>
          </div>

          <div className="card-header" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '18px' }}>
            <h3 className="card-title">Guardian & Contact Information</h3>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '18px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Guardian Name</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.guardianName}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Guardian Contact</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.guardianContact}</p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Residential Address</span>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{profileData.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Information"
        subtitle="Update contact phone and residence details"
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentProfile;
