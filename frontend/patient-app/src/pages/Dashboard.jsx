import { Link } from 'react-router-dom';
import { FiLogOut, FiMessageSquare, FiUserCheck, FiBell, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import FaceSetupCard from '../components/FaceSetupCard';
import '../styles/modern.css';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const { t } = useLanguage();
  
  return (
    <div className="dashboard" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <nav className="modern-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>SehatMitra</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser size={18} /> {user.fullName}
            </span>
            <button onClick={onLogout} className="btn-modern-primary">
              <FiLogOut size={18} /> {t('common.logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="section-header">
          <h3 className="section-title">{t('dashboard.healthServices')}</h3>
          <p className="section-description">{t('dashboard.accessHealthcare')}</p>
        </div>

        <div className="modern-grid fade-in-up">
          <Link to="/select-doctor" className="feature-card">
            <div className="icon-container">
              <FiUserCheck size={24} />
            </div>
            <div>
              <h3>{t('dashboard.consultDoctor')}</h3>
              <p>{t('dashboard.consultDoctorDesc')}</p>
            </div>
          </Link>

          <Link to="/consultation-history" className="feature-card">
            <div className="icon-container">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h3>{t('dashboard.myConsultations')}</h3>
              <p>{t('dashboard.myConsultationsDesc')}</p>
            </div>
          </Link>

          <Link to="/follow-up-requests" className="feature-card">
            <div className="icon-container">
              <FiBell size={24} />
            </div>
            <div>
              <h3>{t('dashboard.followUpRequests')}</h3>
              <p>{t('dashboard.followUpRequestsDesc')}</p>
            </div>
          </Link>

          <Link to="/ai-consultant" className="feature-card">
            <div className="icon-container">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h3>{t('dashboard.aiHealthAssistant')}</h3>
              <p>{t('dashboard.aiHealthAssistantDesc')}</p>
            </div>
          </Link>
        </div>

        <div className="profile-card mt-4" style={{ marginTop: 'var(--spacing-2xl)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUser size={24} /> {t('dashboard.profileInfo')}
          </h3>
          <div className="profile-grid">
            <div className="profile-item">
              <div className="profile-item-label">{t('dashboard.fullName')}</div>
              <div className="profile-item-value">{user.fullName}</div>
            </div>
            <div className="profile-item">
              <div className="profile-item-label">{t('dashboard.email')}</div>
              <div className="profile-item-value">{user.email}</div>
            </div>
            <div className="profile-item">
              <div className="profile-item-label">{t('dashboard.phone')}</div>
              <div className="profile-item-value">{user.phone}</div>
            </div>
            <div className="profile-item">
              <div className="profile-item-label">{t('dashboard.accountType')}</div>
              <div className="profile-item-value" style={{ textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
        </div>

        <FaceSetupCard user={user} />
      </div>
    </div>
  );
}

export default Dashboard;
