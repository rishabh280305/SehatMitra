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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>SehatMitra ASHA</h1>
          <div className="user-info">
            <FiUser />
            <span>{user?.fullName || 'ASHA Worker'}</span>
            <button onClick={onLogout} className="btn-logout">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/my-patients?filter=all')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-circle patients">
              <FiUsers size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.patientsRegistered}</h3>
              <p>My Patients</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/my-patients?filter=pending')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-circle consultations">
              <FiActivity size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.pendingPatients}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/my-patients?filter=completed')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-circle inventory">
              <FiCheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.completedToday}</h3>
              <p>Completed Today</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/my-patients?filter=in_consultation')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-circle tasks">
              <FiClipboard size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.inConsultation}</h3>
              <p>In Consultation</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="quick-actions full-width">
            <div className="section-header">
              <h2>Quick Actions</h2>
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
              <button className="action-btn" onClick={() => navigate('/consultations')}>
                <FiClipboard size={20} />
                <span>Patient Consultations</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/ai-consultant')}>
                <FiMessageCircle size={20} />
                <span>AI Consultation</span>
              </button>
            </div>
          </div>

          <div className="tasks-inventory-grid">
            <div className="tasks-section">
              <div className="section-header">
                <h2>Today's Tasks</h2>
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
                        {task.done ? '✓ Done' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="inventory-section">
              <div className="section-header">
                <h2>Inventory Status</h2>
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
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <FaceSetupCard user={user} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
