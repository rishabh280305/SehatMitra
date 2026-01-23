import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import FaceCapture from '../components/FaceCapture';
import './Auth.css';

function Login({ setUser }) {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFaceCapture = async (faceDescriptor) => {
    setLoading(true);
    try {
      const response = await authService.faceLogin({
        email: formData.email,
        faceDescriptor
      });
      
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1>SehatMitra</h1>
            <select 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
              <option value="gu">ગુજરાતી</option>
            </select>
          </div>
          <h2>{t('login.title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>{t('login.email')}</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('login.email')}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('login.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('login.password')}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('login.loginButton')}
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
          className="btn-face-login"
          disabled={loading}
        >
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}></span>
          Login with Face Verification
        </button>

        <div className="auth-footer">
          <p>{t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link></p>
        </div>
      </div>
      )}
    </div>
  );
}

export default Login;
