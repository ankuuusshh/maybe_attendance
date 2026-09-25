import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  RefreshCw,
  Trash2,
  Sparkles,
  Info,
  ShieldCheck,
  VideoOff
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import './FaceRegistration.css';

const FaceRegistration = () => {
  const [samples, setSamples] = useState([
    {
      id: 1,
      angle: 'Front View (Neutral)',
      url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      confidence: '99.4%'
    },
    {
      id: 2,
      angle: 'Slight Left 30°',
      url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
      confidence: '98.7%'
    }
  ]);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('In Progress');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start real webcam preview if available, else graceful fallback
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        throw new Error('Media devices not supported in this browser environment');
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Camera access not detected or permission denied. You can still test with simulated capture or photo upload.');
      setCameraActive(true); // Still enable simulated viewfinder mode
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const angles = ['Right Angle 30°', 'Slight Smile', 'Tilted Angle', 'High Angle'];
      const nextAngle = angles[samples.length % angles.length];
      
      const newSample = {
        id: Date.now(),
        angle: nextAngle,
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        confidence: `${(96 + Math.random() * 3.5).toFixed(1)}%`
      };

      const updated = [...samples, newSample];
      setSamples(updated);
      setIsProcessing(false);

      if (updated.length >= 3) {
        setRegistrationStatus('Completed');
      }
    }, 600);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSample = {
          id: Date.now(),
          angle: `Uploaded Sample #${samples.length + 1}`,
          url: event.target.result,
          confidence: '97.8%'
        };
        const updated = [...samples, newSample];
        setSamples(updated);
        if (updated.length >= 3) {
          setRegistrationStatus('Completed');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSample = (id) => {
    const updated = samples.filter((s) => s.id !== id);
    setSamples(updated);
    if (updated.length < 3) {
      setRegistrationStatus('In Progress');
    }
  };

  return (
    <div className="face-registration-page">
      <PageHeader
        title="Biometric Face Registration"
        subtitle="Enroll high-precision facial geometry samples for contactless AI attendance recognition"
        badge={
          <StatusBadge
            status={registrationStatus === 'Completed' ? 'Completed' : 'Pending'}
            text={`Face Registration: ${registrationStatus}`}
          />
        }
      />

      {/* Guidelines Card */}
      <div className="card instructions-card">
        <div className="card-header">
          <h3 className="card-title">
            <Info size={18} color="var(--primary)" />
            Capture Guidelines for Maximum AI Accuracy
          </h3>
          <span className="badge badge-primary">3-5 face samples are recommended</span>
        </div>

        <div className="instructions-grid">
          <div className="instruction-item">
            <div className="instruction-number">1</div>
            <div>
              <strong>Make sure your face is clearly visible</strong>
              <p>Keep your entire face centered without blocking your forehead or chin.</p>
            </div>
          </div>

          <div className="instruction-item">
            <div className="instruction-number">2</div>
            <div>
              <strong>Use good, even lighting</strong>
              <p>Avoid harsh backlights, deep shadows, or dark rooms during capture.</p>
            </div>
          </div>

          <div className="instruction-item">
            <div className="instruction-number">3</div>
            <div>
              <strong>Look directly at the camera</strong>
              <p>Maintain eye-level contact with the lens for primary neutral pose.</p>
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
              <strong>Capture multiple natural angles</strong>
              <p>Provide front, slight left (30°), and slight right (30°) orientations.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="registration-layout">
        {/* Camera / Viewfinder Box */}
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
                {/* Real video if stream exists */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`webcam-stream ${cameraError ? 'hide-video' : ''}`}
                />

                {/* Simulated viewfinder if stream fails/unavailable */}
                {cameraError && (
                  <div className="simulated-viewfinder">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80"
                      alt="Simulated Camera Stream"
                      className="simulated-feed"
                    />
                    <div className="simulated-tag">Simulated Camera Feed</div>
                  </div>
                )}

                {/* Face Targeting Reticle / Oval */}
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
                <p>Click "Start Camera" to activate your webcam or upload existing portrait images.</p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="camera-error-banner">
              <AlertCircle size={16} />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="camera-actions-bar">
            {!cameraActive ? (
              <Button
                variant="primary"
                icon={Camera}
                size="md"
                onClick={startCamera}
              >
                Start Camera
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  icon={Camera}
                  size="md"
                  loading={isProcessing}
                  onClick={handleCapture}
                >
                  Capture Photo
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={stopCamera}
                >
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
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Enrolled Samples Gallery */}
        <div className="card samples-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Enrolled Biometric Samples</h3>
              <p className="card-subtitle">{samples.length} of 5 recommended samples collected</p>
            </div>
            <span className="badge badge-info">{samples.length} Enrolled</span>
          </div>

          {samples.length === 0 ? (
            <div className="empty-samples">
              <ScanFace size={36} color="var(--text-light)" />
              <p>No face samples registered yet. Capture or upload at least 3 samples to enable automatic AI attendance.</p>
            </div>
          ) : (
            <div className="samples-grid">
              {samples.map((sample, idx) => (
                <div key={sample.id} className="sample-card">
                  <div className="sample-img-wrap">
                    <img src={sample.url} alt={`Face sample ${idx + 1}`} />
                    <button
                      className="sample-delete-btn"
                      onClick={() => handleDeleteSample(sample.id)}
                      title="Delete sample"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="sample-conf-tag">
                      <Sparkles size={10} /> {sample.confidence} Match
                    </span>
                  </div>
                  <div className="sample-meta">
                    <span className="sample-label">Sample #{idx + 1}</span>
                    <span className="sample-angle">{sample.angle}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Architecture Note */}
          <div className="ai-pipeline-note">
            <ShieldCheck size={18} className="pipeline-icon" />
            <div>
              <strong>Future AI Service Pipeline:</strong>
              <p>
                In production, captured images are transmitted via Node.js to the Python FastAPI backend, where <strong>ageitgey/face_recognition</strong> calculates a 128-dimensional biometric facial embedding vector stored securely in MongoDB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
