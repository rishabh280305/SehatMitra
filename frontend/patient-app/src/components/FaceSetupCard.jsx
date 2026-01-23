import { useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import FaceCapture from './FaceCapture';
import { FiShield, FiCheck, FiCamera } from 'react-icons/fi';

function FaceSetupCard({ user }) {
  const [showCapture, setShowCapture] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFaceCapture = async (faceDescriptor) => {
    setLoading(true);
    try {
      await authService.registerFace(faceDescriptor);
      toast.success('Face registered successfully! You can now login with face verification.');
      setShowCapture(false);
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
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <button 
          onClick={() => setShowCapture(false)}
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back
        </button>
        <FaceCapture onFaceCapture={handleFaceCapture} mode="register" />
      </div>
    );
  }

  return (
    <div style={{
      background: user?.faceVerificationEnabled 
        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        : 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      border: `2px solid ${user?.faceVerificationEnabled ? '#10b981' : '#fb923c'}`,
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: user?.faceVerificationEnabled 
        ? '0 4px 12px rgba(16, 185, 129, 0.15)'
        : '0 4px 12px rgba(251, 146, 60, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ 
          width: '72px', 
          height: '72px',
          background: user?.faceVerificationEnabled ? '#10b981' : '#fb923c',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: 'white',
          flexShrink: 0
        }}>
          {user?.faceVerificationEnabled ? <FiCheck size={36} /> : <FiShield size={36} />}
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h3 style={{ 
            margin: 0, 
            marginBottom: '0.75rem',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {user?.faceVerificationEnabled 
              ? 'Face Verification Active' 
              : 'Enable Face Verification'}
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#4b5563', 
            fontSize: '0.95rem', 
            lineHeight: '1.6',
            marginBottom: '0.5rem'
          }}>
            {user?.faceVerificationEnabled 
              ? 'Your account is protected with facial recognition. You can update your face data anytime for better security.'
              : 'Enhance your account security with facial recognition. Login faster and more securely without passwords.'}
          </p>
          {!user?.faceVerificationEnabled && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: '#6b7280'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%' }}></div>
                Faster login
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%' }}></div>
                More secure
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%' }}></div>
                Password-free
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowCapture(true)}
          disabled={loading}
          style={{
            padding: '0.875rem 1.75rem',
            background: user?.faceVerificationEnabled 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #fb923c, #f97316)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <FiCamera size={18} />
          {loading ? 'Processing...' : user?.faceVerificationEnabled ? 'Update Face' : 'Setup Now'}
        </button>
      </div>
    </div>
  );
}

export default FaceSetupCard;
