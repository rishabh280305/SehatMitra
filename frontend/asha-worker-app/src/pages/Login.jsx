import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import FaceCapture from '../components/FaceCapture';
import './Auth.css';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [useFaceLogin, setUseFaceLogin] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFaceCapture = async (faceDescriptor) => {
    setLoading(true);
    try {
      // Send face descriptor to backend for verification
      const response = await authService.faceLogin({
        email: formData.email,
        faceDescriptor
      });
      
      if (response.user.role !== 'asha_worker') {
        toast.error('Access denied. ASHA Worker credentials required.');
        authService.logout();
        setLoading(false);
        return;
      }

      setUser(response.user);
      toast.success('Face verification successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Face verification failed');
      setShowFaceCapture(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(formData);
      
      if (data.user.role !== 'asha_worker') {
        toast.error('Access denied. ASHA Worker credentials required.');
        authService.logout();
        setLoading(false);
        return;
      }

      setUser(data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showFaceCapture ? (
        <FaceCapture onFaceCapture={handleFaceCapture} mode="login" />
      ) : (
        <div className="auth-card">
          <div className="auth-header">
            <h1>SehatMitra</h1>
            <h2>ASHA Worker Login</h2>
            <p>Access your community health portal</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="asha@test.com"
                required
              />
            </div>

            {!useFaceLogin && (
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required={!useFaceLogin}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Password'}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            onClick={() => {
              if (!formData.email) {
                toast.error('Please enter your email first');
                return;
              }
              setShowFaceCapture(true);
            }}
            className="btn btn-face-login"
            disabled={loading}
          >
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}></span>
            Login with Face Verification
          </button>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
            <div className="test-credentials">
              <p>Test Credentials:</p>
              <p>Email: asha@test.com</p>
              <p>Password: password123</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
