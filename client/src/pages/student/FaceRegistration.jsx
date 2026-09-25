import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  Trash2,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { aiApi } from '../../services/api';
import './FaceRegistration.css';

const FaceRegistration = () => {
  // Real samples uploaded by the user (each is a File object + preview URL)
  const [samples, setSamples] = useState([]);
  const [totalSamples, setTotalSamples] = useState(0);
  const [faceRegistered, setFaceRegistered] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);  // ID of sample being uploaded
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch current registration status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await aiApi.getFaceStatus();
        setFaceRegistered(data.faceRegistered || false);
        setTotalSamples(data.totalSamples || 0);
      } catch (err) {
        // If AI service is down, just show unregistered state
        console.warn('Could not fetch face status:', err.message);
      }
    };
    fetchStatus();
  }, []);

  const registrationStatus = faceRegistered ? 'Completed' : 'In Progress';

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        throw new Error('Camera not supported');
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError('Camera access denied or not available. Please use photo upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // ── Capture frame from webcam → convert to File → upload to AI ─────────────
  const handleCapture = async () => {
    if (!videoRef.current || !cameraActive) return;

    setIsProcessing(true);
    setGlobalError('');
    setSuccessMsg('');

    try {
      // Draw current video frame to a canvas
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext('2d').drawImage(video, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      if (!blob) throw new Error('Failed to capture frame.');

      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadFacePhoto(file, URL.createObjectURL(blob));
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Upload photo from file input ─────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGlobalError('');
    setSuccessMsg('');
    setIsProcessing(true);

    const previewUrl = URL.createObjectURL(file);
    try {
      await uploadFacePhoto(file, previewUrl);
    } catch (err) {
      setGlobalError(err.message);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsProcessing(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Core: send photo to AI service via backend ───────────────────────────
  const uploadFacePhoto = async (file, previewUrl) => {
    const tempId = Date.now();

    // Add placeholder while uploading
    setSamples((prev) => [
      ...prev,
      { id: tempId, url: previewUrl, status: 'uploading', angle: `Sample #${prev.length + 1}` },
    ]);
    setUploadingId(tempId);

    try {
      const result = await aiApi.registerFace(file);

      // Update placeholder to success
      setSamples((prev) =>
        prev.map((s) =>
          s.id === tempId
            ? { ...s, status: 'success', totalSamples: result.totalSamples }
            : s
        )
      );
      setTotalSamples(result.totalSamples);
      setFaceRegistered(result.faceRegistered);
      setSuccessMsg(
        `✓ Face sample registered! You now have ${result.totalSamples} sample${result.totalSamples !== 1 ? 's' : ''} stored.`
      );
    } catch (err) {
      // Remove failed placeholder and show error
      setSamples((prev) => prev.filter((s) => s.id !== tempId));
      URL.revokeObjectURL(previewUrl);
      throw new Error(err.message || 'Face registration failed.');
    } finally {
      setUploadingId(null);
    }
  };

  // ── Delete a local sample preview (does NOT remove from DB — clears all) ──
  const handleDeleteSample = (id) => {
    setSamples((prev) => {
      const s = prev.find((x) => x.id === id);
      if (s?.url) URL.revokeObjectURL(s.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  // ── Clear ALL encodings from DB ────────────────────────────────────────────
  const handleClearAll = async () => {
    setIsClearing(true);
    setGlobalError('');
    setSuccessMsg('');
    try {
      await aiApi.clearFaceEncodings();
      setSamples([]);
      setTotalSamples(0);
      setFaceRegistered(false);
      setSuccessMsg('All face samples cleared from the system.');
    } catch (err) {
      setGlobalError(err.message || 'Failed to clear samples.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="face-registration-page">
      <PageHeader
        title="Biometric Face Registration"
        subtitle="Register your face for contactless AI-powered attendance recognition"
        badge={
          <StatusBadge
            status={faceRegistered ? 'Completed' : 'Pending'}
            text={`Face Registration: ${registrationStatus} ${totalSamples > 0 ? `(${totalSamples} sample${totalSamples !== 1 ? 's' : ''})` : ''}`}
          />
        }
      />

      {/* Status Messages */}
      {globalError && (
        <div className="error-banner" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{globalError}</span>
        </div>
      )}
      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            color: 'var(--success)',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Registration progress bar */}
      {totalSamples > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <ShieldCheck size={20} color={totalSamples >= 3 ? 'var(--success)' : 'var(--warning)'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {totalSamples >= 3
                ? '✓ Sufficient samples for AI attendance recognition'
                : `${totalSamples}/3 minimum samples — add ${3 - totalSamples} more for reliable recognition`}
            </div>
            <div
              style={{
                height: '6px',
                background: 'var(--border)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (totalSamples / 5) * 100)}%`,
                  background: totalSamples >= 3 ? 'var(--success)' : 'var(--warning)',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {totalSamples} / 5
          </span>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="card instructions-card">
        <div className="card-header">
          <h3 className="card-title">
            <Info size={18} color="var(--primary)" />
            Capture Guidelines for Maximum AI Accuracy
          </h3>
          <span className="badge badge-primary">3-5 face samples recommended</span>
        </div>

        <div className="instructions-grid">
          <div className="instruction-item">
            <div className="instruction-number">1</div>
            <div>
              <strong>Clear, centered face</strong>
              <p>Keep your entire face within frame without blocking forehead or chin.</p>
            </div>
          </div>
          <div className="instruction-item">
            <div className="instruction-number">2</div>
            <div>
              <strong>Good, even lighting</strong>
              <p>Avoid harsh backlights, deep shadows, or dark environments.</p>
            </div>
          </div>
          <div className="instruction-item">
            <div className="instruction-number">3</div>
            <div>
              <strong>Look directly at camera</strong>
              <p>Maintain eye-level contact with the lens for your primary pose.</p>
            </div>
          </div>
          <div className="instruction-item">
            <div className="instruction-number">4</div>
            <div>
              <strong>Remove face coverings</strong>
              <p>Take off sunglasses, caps, or masks that obscure facial landmarks.</p>
            </div>
          </div>
          <div className="instruction-item">
            <div className="instruction-number">5</div>
            <div>
              <strong>Multiple natural angles</strong>
              <p>Capture front, slight left (30°), and slight right (30°) orientations.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="registration-layout">
        {/* Camera / Capture Card */}
        <div className="card camera-card">
          <div className="card-header">
            <h3 className="card-title">
              <Camera size={18} color="var(--primary)" />
              Camera Viewfinder
            </h3>
            {cameraActive && (
              <span className="badge badge-safe">
                <span className="live-dot" /> Live Lens
              </span>
            )}
          </div>

          <div className="viewfinder-container">
            {cameraActive ? (
              <div className="viewfinder-active">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="webcam-stream"
                />
                {/* Hidden canvas for frame capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="face-target-oval">
                  <div className="oval-border" />
                  <div className="scan-laser-line" />
                </div>
                <div className="viewfinder-overlay-hints">
                  <span>Align face within guide oval</span>
                </div>
              </div>
            ) : (
              <div className="camera-placeholder">
                <div className="camera-icon-circle">
                  <ScanFace size={52} />
                </div>
                <h4>Camera is Currently Inactive</h4>
                <p>Click "Start Camera" to activate your webcam or upload face photos directly.</p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="camera-error-banner">
              <AlertCircle size={16} />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="camera-actions-bar">
            {!cameraActive ? (
              <Button variant="primary" icon={Camera} size="md" onClick={startCamera}>
                Start Camera
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  icon={isProcessing ? Loader2 : Camera}
                  size="md"
                  loading={isProcessing}
                  onClick={handleCapture}
                >
                  {isProcessing ? 'Processing...' : 'Capture & Register'}
                </Button>
                <Button variant="secondary" size="md" onClick={stopCamera}>
                  Stop Camera
                </Button>
              </div>
            )}

            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                icon={Upload}
                size="md"
                loading={isProcessing}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Registered Samples Gallery */}
        <div className="card samples-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Registered Biometric Samples</h3>
              <p className="card-subtitle">
                {totalSamples} of 5 recommended samples stored in database
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-info">{totalSamples} Stored</span>
              {totalSamples > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  loading={isClearing}
                  onClick={handleClearAll}
                  style={{ color: 'var(--danger)', fontSize: '0.8rem' }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {samples.length === 0 && totalSamples === 0 ? (
            <div className="empty-samples">
              <ScanFace size={36} color="var(--text-light)" />
              <p>
                No face samples registered yet. Capture or upload at least 3 photos to enable
                automatic AI attendance.
              </p>
            </div>
          ) : samples.length === 0 && totalSamples > 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 20px',
                color: 'var(--text-secondary)',
              }}
            >
              <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: '12px' }} />
              <h4 style={{ color: 'var(--success)', marginBottom: '8px' }}>
                {totalSamples} sample{totalSamples !== 1 ? 's' : ''} stored in database
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                Your face encodings are securely stored. Upload more samples to improve accuracy, or
                clear all to re-register.
              </p>
            </div>
          ) : (
            <div className="samples-grid">
              {samples.map((sample, idx) => (
                <div key={sample.id} className="sample-card">
                  <div className="sample-img-wrap">
                    <img src={sample.url} alt={`Face sample ${idx + 1}`} />
                    {sample.status === 'uploading' ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.55)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Loader2 size={28} color="#fff" className="animate-spin" />
                      </div>
                    ) : (
                      <>
                        <button
                          className="sample-delete-btn"
                          onClick={() => handleDeleteSample(sample.id)}
                          title="Remove preview"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="sample-conf-tag">
                          <Sparkles size={10} /> Registered
                        </span>
                      </>
                    )}
                  </div>
                  <div className="sample-meta">
                    <span className="sample-label">Sample #{idx + 1}</span>
                    <span className="sample-angle">
                      {sample.status === 'uploading' ? 'Registering...' : '128-d encoding saved'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Architecture Note */}
          <div className="ai-pipeline-note">
            <ShieldCheck size={18} className="pipeline-icon" />
            <div>
              <strong>AI Service Pipeline:</strong>
              <p>
                Photos are sent to the Python FastAPI backend where{' '}
                <strong>ageitgey/face_recognition</strong> extracts a 128-dimensional biometric
                encoding stored securely in MongoDB. Your actual photo is NOT stored — only the
                mathematical representation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
