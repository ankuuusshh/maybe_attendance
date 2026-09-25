import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Image as ImageIcon
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { INITIAL_CLASSROOMS, INITIAL_SUBJECTS, DUMMY_AI_STUDENTS_RESULT } from '../../data/dummyData';
import './TakeAttendance.css';

const DEFAULT_SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80';

const TakeAttendance = () => {
  const navigate = useNavigate();

  // Steps: 1: Classroom & Subject | 2: Photo Capture | 3: AI Processing & Verification
  const [currentStep, setCurrentStep] = useState(1);

  // Form selections
  const [selectedClassroom, setSelectedClassroom] = useState('c1');
  const [selectedSubject, setSelectedSubject] = useState('sub1');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('10:00 AM');

  // Photo state
  const [classroomPhoto, setClassroomPhoto] = useState(null);
  const fileInputRef = useRef(null);

  // AI Simulation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisStage, setAiAnalysisStage] = useState('');
  const [aiDone, setAiDone] = useState(false);

  // Attendance Student Results
  const [attendanceList, setAttendanceList] = useState(DUMMY_AI_STUDENTS_RESULT);
  const [stats, setStats] = useState({
    detectedFaces: 38,
    recognizedStudents: 36,
    unknownFaces: 2,
    avgConfidence: '94.2%'
  });

  // Step 1 -> 2
  const handleProceedToPhoto = (e) => {
    e.preventDefault();
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
    }, 1000);

    setTimeout(() => {
      setAiAnalysisStage('Matching encodings against CSE-4A student facial database...');
    }, 2000);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAiDone(true);
      setCurrentStep(3);
    }, 2800);
  };

  // Toggle individual student status
  const toggleStudentStatus = (id) => {
    setAttendanceList((prev) =>
      prev.map((student) => {
        if (student.id === id) {
          const nextStatus = student.status === 'Present' ? 'Absent' : 'Present';
          return { ...student, status: nextStatus };
        }
        return student;
      })
    );
  };

  const markAllPresent = () => {
    setAttendanceList((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
  };

  const markAllAbsent = () => {
    setAttendanceList((prev) => prev.map((s) => ({ ...s, status: 'Absent' })));
  };

  // Save / Confirm Attendance
  const handleConfirmAttendance = () => {
    const presentCount = attendanceList.filter((s) => s.status === 'Present').length;
    const absentCount = attendanceList.length - presentCount;

    // Navigate to /teacher/attendance-result with state
    navigate('/teacher/attendance-result', {
      state: {
        classroom: INITIAL_CLASSROOMS.find((c) => c.id === selectedClassroom)?.name || 'CSE-4A',
        subject: INITIAL_SUBJECTS.find((s) => s.id === selectedSubject)?.name || 'Data Structures',
        date: sessionDate,
        time: sessionTime,
        totalStudents: attendanceList.length,
        present: presentCount,
        absent: absentCount,
        unknownFaces: stats.unknownFaces,
        avgConfidence: stats.avgConfidence,
        students: attendanceList
      }
    });
  };

  const currentClassObj = INITIAL_CLASSROOMS.find((c) => c.id === selectedClassroom);
  const currentSubObj = INITIAL_SUBJECTS.find((s) => s.id === selectedSubject);

  return (
    <div className="take-attendance-page">
      <PageHeader
        title="AI Classroom Attendance"
        subtitle="Capture or upload high-resolution classroom snapshot for multi-student facial recognition"
      />

      {/* Workflow Step Tracker */}
      <div className="steps-tracker-card">
        <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-circle">1</div>
          <div className="step-label-group">
            <span className="step-num">Step 1</span>
            <span className="step-name">Select Class & Subject</span>
          </div>
        </div>

        <ChevronRight size={18} className="step-arrow" />

        <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
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
            <span className="step-name">AI Recognition & Confirm</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Classroom & Subject */}
      {currentStep === 1 && (
        <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="card-header">
            <h3 className="card-title">STEP 1: Select Classroom and Lecture Session</h3>
          </div>

          <form onSubmit={handleProceedToPhoto}>
            <div className="form-group">
              <label className="form-label">Select Classroom *</label>
              <select
                className="form-select"
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                {INITIAL_CLASSROOMS.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.displayName} ({cls.totalStudents} Students)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Subject *</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {INITIAL_SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code}) • {sub.credits} Credits
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Session Date</label>
                <input
                  type="date"
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button type="submit" variant="primary" size="lg" icon={ChevronRight} iconPosition="right">
                Continue to Photo Capture
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: Photo Capture / Upload & AI Processing */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">STEP 2: Capture or Upload Classroom Photo</h3>
              <p className="card-subtitle">
                Classroom: <strong>{currentClassObj?.name}</strong> • Subject: <strong>{currentSubObj?.name}</strong>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
              Change Class
            </Button>
          </div>

          {!classroomPhoto ? (
            <div className="photo-upload-dropzone">
              <div className="dropzone-icon-ring">
                <ImageIcon size={42} />
              </div>
              <h4>Upload Classroom Photo</h4>
              <p>Take a wide photo of the lecture hall or upload an existing group image from your device.</p>

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

              <span className="dropzone-supported">Supports high-res JPG, PNG, WEBP (Wide lens recommended)</span>
            </div>
          ) : (
            <div className="preview-and-actions">
              {/* Photo Preview Container with Mock Bounding Boxes */}
              <div className="photo-preview-wrapper">
                <img
                  src={classroomPhoto}
                  alt="Classroom Snapshot"
                  className="classroom-preview-img"
                />

                {/* Simulated AI Detection Overlay Bounding Boxes */}
                <div className="face-bounding-box box-1">
                  <span className="box-tag">96% Ankush</span>
                </div>
                <div className="face-bounding-box box-2">
                  <span className="box-tag">94% Rahul</span>
                </div>
                <div className="face-bounding-box box-3">
                  <span className="box-tag">97% Priya</span>
                </div>
                <div className="face-bounding-box box-4">
                  <span className="box-tag unknown-tag">Unknown Face</span>
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

              {/* Run AI Face Recognition Button & Loading Indicator */}
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
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
                      Simulates Python FastAPI face detection & student database matching
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Display AI Results & Manual Verification Table */}
      {currentStep === 3 && (
        <div className="ai-results-section">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-4" style={{ marginBottom: '22px' }}>
            <div className="result-kpi-card">
              <span className="kpi-label">Detected Faces</span>
              <h3 className="kpi-val" style={{ color: 'var(--text-main)' }}>{stats.detectedFaces}</h3>
              <span className="kpi-sub">Total faces in frame</span>
            </div>
            <div className="result-kpi-card">
              <span className="kpi-label">Recognized Students</span>
              <h3 className="kpi-val" style={{ color: 'var(--success)' }}>{stats.recognizedStudents}</h3>
              <span className="kpi-sub">Biometrically matched</span>
            </div>
            <div className="result-kpi-card">
              <span className="kpi-label">Unknown Faces</span>
              <h3 className="kpi-val" style={{ color: 'var(--warning)' }}>{stats.unknownFaces}</h3>
              <span className="kpi-sub">Guests / unmapped faces</span>
            </div>
            <div className="result-kpi-card">
              <span className="kpi-label">Average Confidence</span>
              <h3 className="kpi-val" style={{ color: 'var(--primary)' }}>{stats.avgConfidence}</h3>
              <span className="kpi-sub">Cosine similarity index</span>
            </div>
          </div>

          {/* Student Verification Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Student Attendance Verification Roster</h3>
                <p className="card-subtitle">
                  Review recognized identities. Teachers can manually override any student's status before committing.
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

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>AI Confidence</th>
                    <th>Attendance Status</th>
                    <th style={{ textAlign: 'right' }}>Manual Override Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={st.avatar}
                            alt={st.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 700 }}>{st.name}</span>
                        </div>
                      </td>
                      <td>
                        <code>{st.rollNo}</code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: st.confidence >= 90 ? 'var(--success)' : 'var(--warning)'
                            }}
                          >
                            {st.confidence}%
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={st.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={`status-toggle-pill ${st.status === 'Present' ? 'toggle-present' : 'toggle-absent'}`}
                          onClick={() => toggleStudentStatus(st.id)}
                        >
                          {st.status === 'Present' ? (
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

            {/* Bottom Confirmation Action */}
            <div className="attendance-confirm-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Confirmed records will be logged into the college attendance repository.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                >
                  Re-analyze Photo
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Check}
                  onClick={handleConfirmAttendance}
                >
                  Confirm Attendance
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
