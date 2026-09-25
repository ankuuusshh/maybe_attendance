import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { classroomApi, attendanceApi } from '../../services/api';
import './TakeAttendance.css';

const DEFAULT_SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80';

const TakeAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1: Classroom | Step 2: Photo Capture | Step 3: Verification & Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Form selections
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(
    location.state?.classroomId || ''
  );
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sessionTime, setSessionTime] = useState('10:00 AM');

  // Loading & error states
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Photo state
  const [classroomPhoto, setClassroomPhoto] = useState(null);
  const fileInputRef = useRef(null);

  // AI Simulation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisStage, setAiAnalysisStage] = useState('');

  // Student Attendance Roster
  const [studentList, setStudentList] = useState([]);

  // 1. Fetch Teacher's Classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const data = await classroomApi.getTeacherClassrooms();
        const list = Array.isArray(data) ? data : data?.classrooms || [];
        setClassrooms(list);
        if (list.length > 0 && !selectedClassroomId) {
          setSelectedClassroomId(list[0]._id);
        }
      } catch (err) {
        setPageError(err.message || 'Failed to fetch your classrooms');
      } finally {
        setLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
  }, []);

  // 2. When classroom changes, fetch full classroom details (with enrolled students)
  useEffect(() => {
    if (!selectedClassroomId) return;
    const fetchClassroomDetails = async () => {
      setLoadingStudents(true);
      try {
        const data = await classroomApi.getById(selectedClassroomId);
        const cls = data?.classroom || data;
        setCurrentClassroom(cls);

        // Populate studentList with enrolled students, default to 'present'
        const students = (cls?.students || []).map((st) => ({
          _id: st._id,
          name: st.name,
          email: st.email,
          rollNumber: st.rollNumber || 'N/A',
          status: 'present',
          confidence: Math.floor(88 + Math.random() * 11),
        }));
        setStudentList(students);
      } catch (err) {
        setPageError(err.message || 'Failed to fetch classroom students');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchClassroomDetails();
  }, [selectedClassroomId]);

  // Step 1 -> 2
  const handleProceedToPhoto = (e) => {
    e.preventDefault();
    if (!selectedClassroomId) {
      setPageError('Please select a classroom first');
      return;
    }
    setPageError('');
    setCurrentStep(2);
  };

  // Image Upload handlers
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setClassroomPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhoto = () => {
    setClassroomPhoto(DEFAULT_SAMPLE_PHOTO);
  };

  // Run AI Simulation
  const handleRunAiRecognition = () => {
    setIsAnalyzing(true);
    setAiAnalysisStage('Detecting human faces in classroom photo (HOG / CNN)...');

    setTimeout(() => {
      setAiAnalysisStage('Extracting 128-dimensional facial biometric encodings...');
    }, 900);

    setTimeout(() => {
      setAiAnalysisStage(
        `Matching encodings against ${currentClassroom?.name || 'classroom'} database...`
      );
    }, 1800);

    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentStep(3);
    }, 2600);
  };

  // Toggle individual student status
  const toggleStudentStatus = (id) => {
    setStudentList((prev) =>
      prev.map((student) => {
        if (student._id === id) {
          const nextStatus = student.status === 'present' ? 'absent' : 'present';
          return { ...student, status: nextStatus };
        }
        return student;
      })
    );
  };

  const markAllPresent = () => {
    setStudentList((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  };

  const markAllAbsent = () => {
    setStudentList((prev) => prev.map((s) => ({ ...s, status: 'absent' })));
  };

  // Save / Confirm Attendance to POST /api/attendance
  const handleConfirmAttendance = async () => {
    if (studentList.length === 0) {
      setSubmitError('No enrolled students to mark attendance for.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      classroomId: selectedClassroomId,
      date: sessionDate,
      attendance: studentList.map((s) => ({
        studentId: s._id,
        status: s.status,
      })),
    };

    try {
      await attendanceApi.mark(payload);
      navigate('/teacher/attendance-result', {
        state: {
          classroomId: selectedClassroomId,
          classroomName: currentClassroom?.name,
          subject: currentClassroom?.subject,
          date: sessionDate,
          time: sessionTime,
        },
      });
    } catch (err) {
      setSubmitError(
        err.message || 'Failed to save attendance. Duplicate record may exist for this date.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = studentList.filter((s) => s.status === 'present').length;
  const absentCount = studentList.length - presentCount;

  return (
    <div className="take-attendance-page">
      <PageHeader
        title="AI Classroom Attendance"
        subtitle="Capture classroom snapshot, verify students, and submit official attendance"
      />

      {pageError && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{pageError}</span>
        </div>
      )}

      {/* Workflow Step Tracker */}
      <div className="steps-tracker-card">
        <div
          className={`step-item ${currentStep >= 1 ? 'active' : ''} ${
            currentStep > 1 ? 'completed' : ''
          }`}
        >
          <div className="step-circle">1</div>
          <div className="step-label-group">
            <span className="step-num">Step 1</span>
            <span className="step-name">Select Class & Date</span>
          </div>
        </div>

        <ChevronRight size={18} className="step-arrow" />

        <div
          className={`step-item ${currentStep >= 2 ? 'active' : ''} ${
            currentStep > 2 ? 'completed' : ''
          }`}
        >
          <div className="step-circle">2</div>
          <div className="step-label-group">
            <span className="step-num">Step 2</span>
            <span className="step-name">Upload Classroom Photo</span>
          </div>
        </div>

        <ChevronRight size={18} className="step-arrow" />

        <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <div className="step-label-group">
            <span className="step-num">Step 3</span>
            <span className="step-name">Verify & Submit</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Classroom & Date */}
      {currentStep === 1 && (
        <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="card-header">
            <h3 className="card-title">STEP 1: Select Classroom and Lecture Session</h3>
          </div>

          {loadingClassrooms ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 size={30} className="animate-spin" color="var(--primary)" />
            </div>
          ) : classrooms.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <AlertCircle size={40} color="var(--warning)" />
              <h4>No Classrooms Found</h4>
              <p>You have not created any classrooms yet. Please create a classroom first.</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/teacher/create-classroom')}
              >
                Create Classroom
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProceedToPhoto}>
              <div className="form-group">
                <label className="form-label">Select Classroom *</label>
                <select
                  className="form-select"
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  required
                >
                  {classrooms.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} — {cls.subject} (Sec {cls.section} • {cls.semester})
                    </option>
                  ))}
                </select>
              </div>

              {currentClassroom && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '18px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Users size={16} color="var(--primary)" />
                  <span>
                    Enrolled Students: <strong>{currentClassroom.students?.length || 0}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Subject: <strong>{currentClassroom.subject}</strong>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Session Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session Timing</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '24px',
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                >
                  Skip Photo (Manual Entry)
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Continue to Photo Capture
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: Photo Capture / Upload & AI Processing */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">STEP 2: Capture or Upload Classroom Photo</h3>
              <p className="card-subtitle">
                Classroom: <strong>{currentClassroom?.name}</strong> • Subject:{' '}
                <strong>{currentClassroom?.subject}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                Change Class
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                Skip to Manual Review
              </Button>
            </div>
          </div>

          {!classroomPhoto ? (
            <div className="photo-upload-dropzone">
              <div className="dropzone-icon-ring">
                <ImageIcon size={42} />
              </div>
              <h4>Upload Classroom Photo</h4>
              <p>
                Take a wide photo of the lecture hall or upload an existing group image from
                your device.
              </p>

              <div className="dropzone-button-group">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <Button
                  variant="primary"
                  icon={Upload}
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <Button
                  variant="secondary"
                  icon={Camera}
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  icon={Sparkles}
                  size="md"
                  onClick={handleUseSamplePhoto}
                >
                  Use Demo Classroom Photo
                </Button>
              </div>

              <span className="dropzone-supported">
                Supports high-res JPG, PNG, WEBP (Wide lens recommended)
              </span>
            </div>
          ) : (
            <div className="preview-and-actions">
              <div className="photo-preview-wrapper">
                <img
                  src={classroomPhoto}
                  alt="Classroom Snapshot"
                  className="classroom-preview-img"
                />

                <div className="face-bounding-box box-1">
                  <span className="box-tag">96% Matched</span>
                </div>
                <div className="face-bounding-box box-2">
                  <span className="box-tag">94% Matched</span>
                </div>
                <div className="face-bounding-box box-3">
                  <span className="box-tag">97% Matched</span>
                </div>
                <div className="face-bounding-box box-4">
                  <span className="box-tag unknown-tag">Unmapped Face</span>
                </div>

                <div className="photo-preview-bar">
                  <span>Photo loaded: Ready for 128-d face recognition analysis</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: '#fff' }}
                    icon={RotateCcw}
                    onClick={() => setClassroomPhoto(null)}
                  >
                    Replace Photo
                  </Button>
                </div>
              </div>

              <div className="run-ai-action-area">
                {isAnalyzing ? (
                  <div className="ai-analyzing-box">
                    <div className="spinner-halo animate-spin" />
                    <div className="analyzing-text-wrap">
                      <h4>Analyzing classroom photo...</h4>
                      <p className="analyzing-stage-text">{aiAnalysisStage}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                    }}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Sparkles}
                      onClick={handleRunAiRecognition}
                      style={{ minWidth: '280px', fontSize: '1rem', padding: '14px 28px' }}
                    >
                      Run AI Face Recognition
                    </Button>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Simulates neural face detection & matches against enrolled classroom students
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Manual Verification & API Submit */}
      {currentStep === 3 && (
        <div className="ai-results-section">
          {submitError && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-4" style={{ marginBottom: '22px' }}>
            <div className="result-kpi-card">
              <span className="kpi-label">Enrolled Students</span>
              <h3 className="kpi-val" style={{ color: 'var(--text-main)' }}>
                {studentList.length}
              </h3>
              <span className="kpi-sub">Total in classroom</span>
            </div>
            <div className="result-kpi-card">
              <span className="kpi-label">Present</span>
              <h3 className="kpi-val" style={{ color: 'var(--success)' }}>
                {presentCount}
              </h3>
              <span className="kpi-sub">Marked to attend</span>
            </div>
            <div className="result-kpi-card">
              <span className="kpi-label">Absent</span>
              <h3 className="kpi-val" style={{ color: 'var(--danger)' }}>
                {absentCount}
              </h3>
              <span className="kpi-sub">Marked absent</span>
            </div>
            <div className="result-kpi-card">
              <span className="kpi-label">Attendance Rate</span>
              <h3 className="kpi-val" style={{ color: 'var(--primary)' }}>
                {studentList.length > 0
                  ? ((presentCount / studentList.length) * 100).toFixed(0) + '%'
                  : '0%'}
              </h3>
              <span className="kpi-sub">For {sessionDate}</span>
            </div>
          </div>

          {/* Student Verification Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Student Attendance Roster</h3>
                <p className="card-subtitle">
                  Classroom: <strong>{currentClassroom?.name}</strong> • Date:{' '}
                  <strong>{sessionDate}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" size="sm" onClick={markAllPresent}>
                  Mark All Present
                </Button>
                <Button variant="ghost" size="sm" onClick={markAllAbsent}>
                  Mark All Absent
                </Button>
              </div>
            </div>

            {loadingStudents ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Loader2 size={28} className="animate-spin" color="var(--primary)" />
              </div>
            ) : studentList.length === 0 ? (
              <div className="empty-state" style={{ padding: '36px 0' }}>
                <Users size={40} color="var(--border)" />
                <h4>No Students Enrolled</h4>
                <p>
                  No students have joined this classroom yet. Share the Classroom ID with
                  students to let them join:
                </p>
                <code
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {selectedClassroomId}
                </code>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email / Roll No</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Toggle Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentList.map((st) => (
                      <tr key={st._id}>
                        <td>
                          <span style={{ fontWeight: 700 }}>{st.name}</span>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontSize: '0.85rem' }}>{st.email}</span>
                            {st.rollNumber && st.rollNumber !== 'N/A' && (
                              <code style={{ display: 'block', fontSize: '0.75rem' }}>
                                {st.rollNumber}
                              </code>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge
                            status={st.status === 'present' ? 'Present' : 'Absent'}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={`status-toggle-pill ${
                              st.status === 'present' ? 'toggle-present' : 'toggle-absent'
                            }`}
                            onClick={() => toggleStudentStatus(st._id)}
                          >
                            {st.status === 'present' ? (
                              <>
                                <CheckCircle2 size={14} /> Present (Click to mark Absent)
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Absent (Click to mark Present)
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Confirmation Action */}
            <div className="attendance-confirm-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Confirmed records will be committed to the official database.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" size="md" onClick={() => setCurrentStep(1)}>
                  Change Class / Date
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Check}
                  loading={submitting}
                  disabled={studentList.length === 0}
                  onClick={handleConfirmAttendance}
                >
                  Submit Official Attendance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAttendance;
