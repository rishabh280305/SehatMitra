import { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import './FaceCapture.css';

function FaceCapture({ onFaceCapture, mode = 'register' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      setModelsLoaded(true);
      setLoading(false);
      startVideo();
    } catch (err) {
      console.error('Error loading face-api models:', err);
      setError('Failed to load face recognition models');
      setLoading(false);
    }
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        setError('Camera access denied. Please enable camera permissions.');
      });
  };

  const handleVideoPlay = () => {
    if (modelsLoaded) {
      detectFace();
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight
    };

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (!video || video.paused || video.ended) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      if (detections.length > 0) {
        setFaceDetected(true);
        // Auto-capture for login mode
        if (mode === 'login' && !capturing) {
          captureFace();
        }
      } else {
        setFaceDetected(false);
      }
    }, 100);
  };

  const captureFace = async () => {
    if (!videoRef.current || !faceDetected || capturing) return;

    setCapturing(true);
    setError('');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please ensure your face is clearly visible.');
        setCapturing(false);
        return;
      }

      // Get face descriptor (128-dimensional array)
      const faceDescriptor = Array.from(detection.descriptor);
      
      // Pass the face descriptor to parent component
      onFaceCapture(faceDescriptor);
      
      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
      
    } catch (err) {
      console.error('Error capturing face:', err);
      setError('Failed to capture face. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="face-capture-container">
      <div className="face-capture-header">
        <h3>
          {mode === 'register' ? '📸 Register Your Face' : '🔐 Verify Your Identity'}
        </h3>
        <p>
          {mode === 'register' 
            ? 'Position your face in the frame and click capture'
            : 'Look at the camera to verify your identity'}
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading face recognition models...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="video-container" style={{ display: loading ? 'none' : 'block' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          width="640"
          height="480"
        />
        <canvas ref={canvasRef} className="face-overlay" />
        
        <div className="face-status">
          {faceDetected ? (
            <span className="status-detected">✅ Face Detected</span>
          ) : (
            <span className="status-searching">👤 Searching for face...</span>
          )}
        </div>
      </div>

      {mode === 'register' && (
        <div className="capture-controls">
          <button
            onClick={captureFace}
            disabled={!faceDetected || capturing || loading}
            className="btn-capture"
          >
            {capturing ? 'Capturing...' : 'Capture Face'}
          </button>
        </div>
      )}
      
      {mode === 'login' && capturing && (
        <div className="capture-controls">
          <p style={{ color: '#4caf50', fontWeight: 600, fontSize: '1.1rem' }}>
            🔐 Verifying your identity...
          </p>
        </div>
      )}

      <div className="instructions">
        <h4>Instructions:</h4>
        <ul>
          <li>✓ Ensure good lighting</li>
          <li>✓ Look directly at the camera</li>
          <li>✓ Remove glasses if possible</li>
          <li>✓ Keep your face centered in the frame</li>
        </ul>
      </div>
    </div>
  );
}

export default FaceCapture;
