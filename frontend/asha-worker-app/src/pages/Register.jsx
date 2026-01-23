import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import FaceCapture from '../components/FaceCapture';
import './Auth.css';

function Register({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'asha_worker',
    ashaWorkerDetails: {
      workerId: '',
      certificationNumber: '',
      assignedArea: '',
      yearsOfExperience: 0,
      languagesSpoken: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  const handleChange = (e) => {
    if (e.target.name.startsWith('asha_')) {
      const field = e.target.name.replace('asha_', '');
      setFormData({
        ...formData,
        ashaWorkerDetails: {
          ...formData.ashaWorkerDetails,
          [field]: field === 'yearsOfExperience' ? parseInt(e.target.value) || 0 : e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFaceCapture = (capturedDescriptor) => {
    setFaceDescriptor(capturedDescriptor);
    setShowFaceCapture(false);
    toast.success('Face captured! Complete registration to save.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse languages
      const langs = formData.ashaWorkerDetails.languagesSpoken;
      const submitData = {
        ...formData,
        ashaWorkerDetails: {
          ...formData.ashaWorkerDetails,
          languagesSpoken: typeof langs === 'string' ? langs.split(',').map(l => l.trim()) : langs
        }
      };
      
      if (faceDescriptor) {
        submitData.faceDescriptor = faceDescriptor;
        submitData.faceVerificationEnabled = true;
      }

      const data = await authService.register(submitData);
      setUser(data.user);
      toast.success(faceDescriptor ? 'Registration successful with face verification!' : 'Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showFaceCapture ? (
        <div>
          <button 
            onClick={() => setShowFaceCapture(false)}
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
            ← Back to Registration
          </button>
          <FaceCapture onFaceCapture={handleFaceCapture} mode="register" />
        </div>
      ) : (
        <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1>SehatMitra</h1>
          <h2>ASHA Worker Registration</h2>
          <p>Register to help your community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h3 style={{ marginBottom: '1rem' }}>Personal Information</h3>
          
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" required />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>ASHA Worker Details</h3>

          <div className="form-row">
            <div className="input-group">
              <label>Worker ID</label>
              <input type="text" name="asha_workerId" value={formData.ashaWorkerDetails.workerId} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Certification Number</label>
              <input type="text" name="asha_certificationNumber" value={formData.ashaWorkerDetails.certificationNumber} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Assigned Area</label>
              <input type="text" name="asha_assignedArea" value={formData.ashaWorkerDetails.assignedArea} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Years of Experience</label>
              <input type="number" name="asha_yearsOfExperience" value={formData.ashaWorkerDetails.yearsOfExperience} onChange={handleChange} min="0" required />
            </div>
          </div>

          <div className="input-group">
            <label>Languages Spoken (comma-separated)</label>
            <input 
              type="text" 
              name="asha_languagesSpoken" 
              value={formData.ashaWorkerDetails.languagesSpoken} 
              onChange={handleChange}
              placeholder="Hindi, English, Gujarati"
              required 
            />
          </div>

          <div style={{
            background: faceDescriptor ? '#e8f5e9' : '#fff3e0',
            border: `2px solid ${faceDescriptor ? '#4caf50' : '#ff9800'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{faceDescriptor ? '' : ''}</span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                  {faceDescriptor ? 'Face Registered' : 'Optional: Register Face'}
                </strong>
                <small style={{ color: '#666' }}>
                  {faceDescriptor ? 'You can login with face verification' : 'Enable quick and secure login'}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setShowFaceCapture(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: faceDescriptor ? '#2196f3' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {faceDescriptor ? 'Recapture' : 'Capture Face'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register as ASHA Worker'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already registered? <Link to="/login">Login here</Link></p>
        </div>
      </div>      )}    </div>
  );
}

export default Register;
