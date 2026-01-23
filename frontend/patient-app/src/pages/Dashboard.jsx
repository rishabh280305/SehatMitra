import { Link } from 'react-router-dom';
import { FiLogOut, FiMessageSquare, FiUserCheck, FiBell, FiUser, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import FaceSetupCard from '../components/FaceSetupCard';
import '../styles/modern.css';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const { t } = useLanguage();
  
  return (
    <div className="dashboard" style={{ background: '#f5f5f7', minHeight: '100vh' }}>
      <nav style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#10b981',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              SM
            </div>
            <div>
              <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>SehatMitra</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>Patient Portal</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <FiUser size={18} /> {user.fullName}
            </span>
            <button onClick={onLogout} style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}>
              <FiLogOut size={18} /> {t('common.logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '4px',
              height: '28px',
              background: 'linear-gradient(to bottom, #10b981, #059669)',
              borderRadius: '2px'
            }}></div>
            {t('dashboard.healthServices')}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginLeft: '1.5rem' }}>{t('dashboard.accessHealthcare')}</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <Link to="/select-doctor" style={{ 
            textDecoration: 'none',
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiUserCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {t('dashboard.consultDoctor')}
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {t('dashboard.consultDoctorDesc')}
              </p>
            </div>
          </Link>

          <Link to="/consultation-history" style={{ 
            textDecoration: 'none',
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {t('dashboard.myConsultations')}
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {t('dashboard.myConsultationsDesc')}
              </p>
            </div>
          </Link>

          <Link to="/follow-up-requests" style={{ 
            textDecoration: 'none',
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiBell size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {t('dashboard.followUpRequests')}
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {t('dashboard.followUpRequestsDesc')}
              </p>
            </div>
          </Link>

          <Link to="/ai-consultant" style={{ 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            border: '1px solid transparent',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {t('dashboard.aiHealthAssistant')}
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {t('dashboard.aiHealthAssistantDesc')}
              </p>
            </div>
          </Link>
        </div>

        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem', 
            color: '#1f2937',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem' 
          }}>
            <FiUser size={24} color="#10b981" /> {t('dashboard.profileInfo')}
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('dashboard.fullName')}
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#1f2937', 
                fontWeight: '500',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                {user.fullName}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('dashboard.email')}
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#1f2937', 
                fontWeight: '500',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiMail size={16} color="#10b981" />
                {user.email}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('dashboard.phone')}
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#1f2937', 
                fontWeight: '500',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiPhone size={16} color="#10b981" />
                {user.phone}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('dashboard.accountType')}
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#1f2937', 
                fontWeight: '500',
                padding: '0.75rem',
                background: '#f0fdf4',
                borderRadius: '6px',
                border: '1px solid #10b981',
                textTransform: 'capitalize'
              }}>
                {user.role}
              </div>
            </div>
          </div>
        </div>

        <FaceSetupCard user={user} />
      </div>
    </div>
  );
}

export default Dashboard;
