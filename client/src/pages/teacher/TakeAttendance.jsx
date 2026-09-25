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
  WifiOff,
  Brain,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { classroomApi, attendanceApi, aiApi } from '../../services/api';
import './TakeAttendance.css';

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

  // Photo state — store as File for API upload
  const [classroomPhotoFile, setClassroomPhotoFile] = useState(null);
  const [classroomPhotoPreview, setClassroomPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // AI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisStage, setAiAnalysisStage] = useState('');
  const [aiServiceAvailable, setAiServiceAvailable] = useState(null); // null=checking, true, false
  const [aiResult, setAiResult] = useState(null); // raw AI response

  // Student Attendance Roster
  const [studentList, setStudentList] = useState([]);

  // ── 1. Check AI service + fetch classrooms ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Check AI health
      try {
        await aiApi.health();
        setAiServiceAvailable(true);
      } catch {
        setAiServiceAvailable(false);
      }

      // Fetch classrooms
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
    init();
  }, []);

  // ── 2. When classroom changes, fetch students ───────────────────────────
  useEffect(() => {
    if (!selectedClassroomId) return;
    const fetchClassroomDetails = async () => {
      setLoadingStudents(true);
      try {
        const data = await classroomApi.getById(selectedClassroomId);
        const cls = data?.classroom || data;
        setCurrentClassroom(cls);

        // Populate roster — default all absent (AI will mark present after recognition)
        const students = (cls?.students || []).map((st) => ({
          _id: st._id,
          name: st.name,
          email: st.email,
          rollNumber: st.rollNumber || 'N/A',
          faceRegistered: st.faceRegistered || false,
          status: 'absent',
          confidence: null,
          aiMatched: false,
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

  // ── Step navigation ─────────────────────────────────────────────────────
  const handleProceedToPhoto = (e) => {
    e.preventDefault();
    if (!selectedClassroomId) {
      setPageError('Please select a classroom first');
      return;
    }
    setPageError('');
    setCurrentStep(2);
  };

  // ── Image Upload ────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setClassroomPhotoFile(file);
      setClassroomPhotoPreview(URL.createObjectURL(file));
      setAiResult(null); // reset previous AI result
    }
  };

  const handleReplacePhoto = () => {
    if (classroomPhotoPreview) URL.revokeObjectURL(classroomPhotoPreview);
    setClassroomPhotoFile(null);
    setClassroomPhotoPreview(null);
    setAiResult(null);
  };

  // ── Real AI Face Recognition ────────────────────────────────────────────
  const handleRunAiRecognition = async () => {
    if (!classroomPhotoFile) return;

    setIsAnalyzing(true);
    setAiResult(null);
    setPageError('');

    const stages = [
      'Detecting human faces using HOG feature descriptor...',
      'Extracting 128-dimensional facial biometric encodings...',
      `Matching against ${currentClassroom?.name || 'classroom'} enrolled students...`,
      'Finalizing attendance recognition results...',
    ];

    // Show progress stages while waiting for API
    let stageIdx = 0;
    setAiAnalysisStage(stages[0]);
    const stageInterval = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1);
      setAiAnalysisStage(stages[stageIdx]);
    }, 900);

    try {
      const result = await aiApi.recognizeClassroom(selectedClassroomId, classroomPhotoFile);
      clearInterval(stageInterval);

      setAiResult(result);

      // Apply AI results to the student roster
      const resultMap = {};
      (result.results || []).forEach((r) => {
        resultMap[r.studentId] = r;
      });

      setStudentList((prev) =>
        prev.map((student) => {
          const match = resultMap[student._id];
          if (match) {
            return {
              ...student,
              status: match.status,
              confidence: match.confidence,
              aiMatched: match.status === 'present',
              faceRegistered: match.faceRegistered ?? student.faceRegistered,
            };
          }
          return student;
        })
      );

      setIsAnalyzing(false);
      setCurrentStep(3);
    } catch (err) {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      setPageError(err.message || 'AI recognition failed. Please try again or use manual entry.');
    }
  };

  // ── Skip to manual entry ────────────────────────────────────────────────
  const handleSkipToManual = () => {
    // Mark all students present by default when skipping AI
    setStudentList((prev) => prev.map((s) => ({ ...s, status: 'present', aiMatched: false })));
    setCurrentStep(3);
  };

  // ── Student status toggle ───────────────────────────────────────────────
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

  // ── Submit Attendance ───────────────────────────────────────────────────
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
          aiUsed: !!aiResult,
          facesDetected: aiResult?.facesDetected,
        },
      });
    } catch (err) {
      setSubmitError(
        err.message || 'Failed to save attendance. A duplicate record may exist for this date.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = studentList.filter((s) => s.status === 'present').length;
  const absentCount = studentList.length - presentCount;
  const faceRegisteredCount = studentList.filter((s) => s.faceRegistered).length;

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

      {/* AI Service status banner */}
      {aiServiceAvailable === false && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--warning)',
            fontSize: '0.875rem',
          }}
        >
          <WifiOff size={16} />
          <span>
            <strong>AI Service Offline</strong> — Python FastAPI is not running. You can still
            take attendance manually. To enable AI recognition, start the AI service.
          </span>
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

      {/* ── STEP 1: Select Classroom & Date ── */}
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
              <p>Create a classroom first before taking attendance.</p>
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
                    flexWrap: 'wrap',
                  }}
                >
                  <Users size={16} color="var(--primary)" />
                  <span>
                    Enrolled: <strong>{currentClassroom.students?.length || 0}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Face-registered:{' '}
                    <strong style={{ color: faceRegisteredCount > 0 ? 'var(--success)' : 'var(--warning)' }}>
                      {faceRegisteredCount}
                    </strong>
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
                  onClick={handleSkipToManual}
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

      {/* ── STEP 2: Photo Upload & AI Processing ── */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">STEP 2: Capture or Upload Classroom Photo</h3>
              <p className="card-subtitle">
                Classroom: <strong>{currentClassroom?.name}</strong> • Subject:{' '}
                <strong>{currentClassroom?.subject}</strong>
                {faceRegisteredCount > 0 && (
                  <>
                    {' '}•{' '}
                    <span style={{ color: 'var(--success)' }}>
                      {faceRegisteredCount} student{faceRegisteredCount !== 1 ? 's' : ''} face-registered
                    </span>
                  </>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                Change Class
              </Button>
              <Button variant="outline" size="sm" onClick={handleSkipToManual}>
                Skip to Manual
              </Button>
            </div>
          </div>

          {/* Warning if no students have face registered */}
          {faceRegisteredCount === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                color: 'var(--warning)',
              }}
            >
              <AlertCircle size={16} />
              <span>
                No students in this classroom have registered their face yet. AI recognition
                will detect faces but won't be able to match them. Ask students to complete{' '}
                <strong>Face Registration</strong> first.
              </span>
            </div>
          )}

          {!classroomPhotoPreview ? (
            <div className="photo-upload-dropzone">
              <div className="dropzone-icon-ring">
                <ImageIcon size={42} />
              </div>
              <h4>Upload Classroom Photo</h4>
              <p>
                Take a wide photo of the lecture hall or upload an existing group image. The AI
                will detect and match student faces automatically.
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
              </div>

              <span className="dropzone-supported">
                Supports JPG, PNG, WEBP — Wide lens recommended for group photos
              </span>
            </div>
          ) : (
            <div className="preview-and-actions">
              <div className="photo-preview-wrapper">
                <img
                  src={classroomPhotoPreview}
                  alt="Classroom Snapshot"
                  className="classroom-preview-img"
                />

                {/* Static bounding box overlays (visual cue) */}
                {aiResult && (
                  <>
                    <div className="face-bounding-box box-1">
                      <span className="box-tag">Face Detected</span>
                    </div>
                    <div className="face-bounding-box box-2">
                      <span className="box-tag">Face Detected</span>
                    </div>
                    {aiResult.facesDetected > 2 && (
                      <div className="face-bounding-box box-3">
                        <span className="box-tag">Face Detected</span>
                      </div>
                    )}
                    {aiResult.unknownFaces > 0 && (
                      <div className="face-bounding-box box-4">
                        <span className="box-tag unknown-tag">Unregistered Face</span>
                      </div>
                    )}
                  </>
                )}

                <div className="photo-preview-bar">
                  <span>
                    {aiResult
                      ? `✓ ${aiResult.facesDetected} face${aiResult.facesDetected !== 1 ? 's' : ''} detected • ${aiResult.unknownFaces} unregistered`
                      : 'Photo loaded — ready for AI face recognition'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: '#fff' }}
                    icon={RotateCcw}
                    onClick={handleReplacePhoto}
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
                    {aiResult && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--success)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={18} />
                        AI matched {aiResult.results?.filter((r) => r.status === 'present').length} student
                        {aiResult.results?.filter((r) => r.status === 'present').length !== 1 ? 's' : ''}
                        {' '}present from {aiResult.facesDetected} face{aiResult.facesDetected !== 1 ? 's' : ''} detected
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      icon={aiServiceAvailable ? Brain : Sparkles}
                      onClick={
                        aiServiceAvailable
                          ? handleRunAiRecognition
                          : handleSkipToManual
                      }
                      style={{ minWidth: '280px', fontSize: '1rem', padding: '14px 28px' }}
                    >
                      {aiResult
                        ? 'Re-run AI Recognition'
                        : aiServiceAvailable
                        ? 'Run AI Face Recognition'
                        : 'Continue to Manual Entry'}
                    </Button>

                    {aiServiceAvailable === false && (
                      <span style={{ fontSize: '0.825rem', color: 'var(--warning)' }}>
                        AI service offline — skipping to manual attendance
                      </span>
                    )}

                    {aiServiceAvailable === true && !aiResult && (
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        Uses ageitgey/face_recognition — 128-d biometric matching against enrolled students
                      </span>
                    )}

                    {aiResult && (
                      <Button
                        variant="outline"
                        size="md"
                        icon={ChevronRight}
                        iconPosition="right"
                        onClick={() => setCurrentStep(3)}
                      >
                        Proceed to Verification
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Manual Verification & Submit ── */}
      {currentStep === 3 && (
        <div className="ai-results-section">
          {submitError && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          {/* AI summary banner */}
          {aiResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 20px',
                marginBottom: '20px',
                fontSize: '0.875rem',
                color: 'var(--primary)',
              }}
            >
              <Brain size={18} />
              <span>
                <strong>AI Recognition Complete</strong> — {aiResult.facesDetected} face
                {aiResult.facesDetected !== 1 ? 's' : ''} detected,{' '}
                {aiResult.results?.filter((r) => r.status === 'present').length} students matched.
                {aiResult.unknownFaces > 0 && (
                  <> {aiResult.unknownFaces} unregistered face{aiResult.unknownFaces !== 1 ? 's' : ''} found.</>
                )}{' '}
                Review and adjust below before submitting.
              </span>
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
                  {aiResult && (
                    <> • <span style={{ color: 'var(--primary)' }}>AI-assisted</span></>
                  )}
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
                  No students have joined this classroom yet. Share the Classroom ID with students:
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
                      <th>Face Reg.</th>
                      <th>AI Confidence</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Toggle</th>
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
                          {st.faceRegistered ? (
                            <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓ Yes</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>— No</span>
                          )}
                        </td>
                        <td>
                          {st.confidence != null ? (
                            <span
                              style={{
                                fontWeight: 700,
                                color:
                                  st.confidence >= 80
                                    ? 'var(--success)'
                                    : st.confidence >= 60
                                    ? 'var(--warning)'
                                    : 'var(--danger)',
                                fontSize: '0.875rem',
                              }}
                            >
                              {st.confidence}%
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {aiResult ? '—' : 'N/A'}
                            </span>
                          )}
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
                                <CheckCircle2 size={14} /> Present (click to mark Absent)
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Absent (click to mark Present)
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

            {/* Confirmation Bar */}
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
