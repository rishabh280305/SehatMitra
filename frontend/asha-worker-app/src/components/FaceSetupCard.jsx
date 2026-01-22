import { useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import FaceCapture from './FaceCapture';

function FaceSetupCard({ user }) {
  const [showCapture, setShowCapture] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFaceCapture = async (faceDescriptor) => {
    setLoading(true);
    try {
      await authService.registerFace(faceDescriptor);
      toast.success('✅ Face registered successfully! You can now login with face verification.');
      setShowCapture(false);
      // Reload to update user state
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Face registration failed');
      setShowCapture(false);
    } finally {
      setLoading(false);
    }
  };

  if (showCapture) {
    return (
      <div>
        <button 
          onClick={() => setShowCapture(false)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <FaceCapture onFaceCapture={handleFaceCapture} mode="register" />
      </div>
    );
  }

  return (
    <div className="face-setup-card" style={{
      background: user?.faceVerificationEnabled ? '#e8f5e9' : '#fff3e0',
      border: `2px solid ${user?.faceVerificationEnabled ? '#4caf50' : '#ff9800'}`,
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>
          {user?.faceVerificationEnabled ? '✅' : '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>
            {user?.faceVerificationEnabled 
              ? 'Face Verification Enabled' 
              : 'Set Up Face Verification'}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {user?.faceVerificationEnabled 
              ? 'You can login using face recognition. Click below to update your face.'
              : 'Login faster and more securely using facial recognition.'}
          </p>
        </div>
        <button
          onClick={() => setShowCapture(true)}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: user?.faceVerificationEnabled ? '#2196f3' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Processing...' : user?.faceVerificationEnabled ? 'Update Face' : 'Register Face'}
        </button>
      </div>
    </div>
  );
}

export default FaceSetupCard;
