import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiClipboard, FiPackage, FiCheckCircle, FiActivity, FiUsers, FiMessageCircle } from 'react-icons/fi';
import axios from 'axios';
import API_BASE_URL from '../config';
import FaceSetupCard from '../components/FaceSetupCard';
import '../styles/modern.css';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Follow-up with Geeta Sharma', time: '10:00 AM', priority: 'high', done: false, patientName: 'Geeta Sharma' },
    { id: 2, title: 'Medicine distribution at Rampur', time: '2:00 PM', priority: 'medium', done: false },
    { id: 3, title: 'Health awareness session', time: '4:00 PM', priority: 'low', done: false },
    { id: 4, title: 'Antenatal checkup - Village visit', time: '5:30 PM', priority: 'medium', done: false }
  ]);
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    if (task.patientName) {
      navigate('/my-patients');
    }
  };

  const markTaskDone = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, done: !task.done } : task
    ));
  };

  const stats = {
    patientsRegistered: patients.length,
    pendingPatients: patients.filter(p => p.status === 'pending').length,
    completedToday: patients.filter(p => {
      const today = new Date().toDateString();
      return p.status === 'completed' && new Date(p.updatedAt).toDateString() === today;
    }).length,
    inConsultation: patients.filter(p => p.status === 'in_consultation').length
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FiActivity size={24} />
          </div>
          <div className="sidebar-brand">
            <h3>SehatMitra</h3>
            <p>ASHA WORKER</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <FiActivity /> Dashboard
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/patient-register'); }}>
            <FiUser /> Register Patient
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/my-patients'); }}>
            <FiUsers /> My Patients
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/ai-consultant'); }}>
            <FiMessageCircle /> AI Consultant
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/inventory'); }}>
            <FiPackage /> Inventory
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div className="user-details">
              <p className="user-name">{user?.fullName || 'ASHA Worker'}</p>
              <p className="user-role">Health Worker</p>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout-sidebar">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Welcome back, {user?.fullName || 'ASHA Worker'}</h1>
            <p>Here's your dashboard overview for today</p>
          </div>
          <div className="hero-stat">
            <h2>{stats.pendingPatients}</h2>
            <p>Pending Consultations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card-new" onClick={() => navigate('/my-patients?filter=all')} style={{ cursor: 'pointer' }}>
            <h3>{loading ? '...' : stats.patientsRegistered}</h3>
            <p>My Patients</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/my-patients'); }}>View all →</a>
          </div>
          <div className="stat-card-new" onClick={() => navigate('/my-patients?filter=pending')} style={{ cursor: 'pointer' }}>
            <h3>{loading ? '...' : stats.pendingPatients}</h3>
            <p>Pending</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/my-patients?filter=pending'); }}>View all →</a>
          </div>
          <div className="stat-card-new" onClick={() => navigate('/my-patients?filter=completed')} style={{ cursor: 'pointer' }}>
            <h3>{loading ? '...' : stats.completedToday}</h3>
            <p>Completed Today</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/my-patients?filter=completed'); }}>View all →</a>
          </div>
          <div className="stat-card-new" onClick={() => navigate('/my-patients?filter=in_consultation')} style={{ cursor: 'pointer' }}>
            <h3>{loading ? '...' : stats.inConsultation}</h3>
            <p>In Consultation</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/my-patients?filter=in_consultation'); }}>View all →</a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/patient-register')}>
              <FiUser size={20} />
              <span>Register Patient</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/my-patients')}>
              <FiUsers size={20} />
              <span>My Patients</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/ai-consultant')}>
              <FiMessageCircle size={20} />
              <span>AI Consultation</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/inventory')}>
              <FiPackage size={20} />
              <span>Inventory</span>
            </button>
          </div>
        </div>

        {/* Tasks and Inventory Grid */}
        <div className="content-grid">
          <div className="content-card">
            <div className="card-header">
              <div className="card-title-with-icon">
                <FiClipboard className="card-icon" />
                <h3>Today's Tasks</h3>
              </div>
            </div>
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-item ${task.priority} ${task.done ? 'done' : ''}`}>
                  <div className="task-info" onClick={() => handleTaskClick(task)} style={{ cursor: task.patientName ? 'pointer' : 'default' }}>
                    <span className="task-title">{task.title}</span>
                    <span className="task-time">{task.time}</span>
                  </div>
                  <div className="task-actions">
                    <span className={`priority-badge ${task.priority}`}>{task.priority.toUpperCase()}</span>
                    <button 
                      className={`btn-mark-done ${task.done ? 'done' : ''}`}
                      onClick={() => markTaskDone(task.id)}
                      title={task.done ? 'Mark as undone' : 'Mark as done'}
                    >
                      {task.done ? 'Done' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <div className="card-title-with-icon">
                <FiPackage className="card-icon" />
                <h3>Inventory Status</h3>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/inventory'); }}>View All</a>
            </div>
            <div className="inventory-list">
              <div className="inventory-item">
                <div className="inventory-info">
                  <span className="item-name">ORS Packets</span>
                  <div className="stock-bar">
                    <div className="stock-fill" style={{ width: '75%', background: '#10b981' }}></div>
                  </div>
                </div>
                <span className="stock-count">45/60</span>
              </div>
              <div className="inventory-item">
                <div className="inventory-info">
                  <span className="item-name">Paracetamol</span>
                  <div className="stock-bar">
                    <div className="stock-fill" style={{ width: '40%', background: '#f59e0b' }}></div>
                  </div>
                </div>
                <span className="stock-count low">24/60</span>
              </div>
              <div className="inventory-item">
                <div className="inventory-info">
                  <span className="item-name">Iron Tablets</span>
                  <div className="stock-bar">
                    <div className="stock-fill" style={{ width: '90%', background: '#10b981' }}></div>
                  </div>
                </div>
                <span className="stock-count">108/120</span>
              </div>
              <div className="inventory-item">
                <div className="inventory-info">
                  <span className="item-name">Bandages</span>
                  <div className="stock-bar">
                    <div className="stock-fill" style={{ width: '25%', background: '#ef4444' }}></div>
                  </div>
                </div>
                <span className="stock-count critical">5/20</span>
              </div>
              <div className="inventory-item">
                <div className="inventory-info">
                  <span className="item-name">Antiseptic</span>
                  <div className="stock-bar">
                    <div className="stock-fill" style={{ width: '60%', background: '#10b981' }}></div>
                  </div>
                </div>
                <span className="stock-count">18/30</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '100%', margin: '2rem 0' }}>
          <FaceSetupCard user={user} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
