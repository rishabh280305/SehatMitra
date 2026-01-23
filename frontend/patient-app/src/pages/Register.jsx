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
    dateOfBirth: '',
    gender: 'male',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const submitData = { ...formData };
      if (faceDescriptor) {
        submitData.faceDescriptor = faceDescriptor;
        submitData.faceVerificationEnabled = true;
      }
      
      const data = await authService.register(submitData);
      setUser(data.user);
      toast.success(faceDescriptor ? 'Registration successful with face verification!' : 'Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Registration failed');
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
        <div className="auth-card">
        <div className="auth-header">
          <h1>SehatMitra</h1>
          <h2>Patient Registration</h2>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength="6"
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
                  {faceDescriptor ? 'You can login with face verification' : 'Enable quick login with face verification'}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
      )}
    </div>
  );
}

export default Register;
