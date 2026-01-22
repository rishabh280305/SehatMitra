import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FiHome, FiPackage, FiActivity, FiBarChart2, 
  FiMenu, FiX, FiLogOut, FiUser, FiSettings 
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/stock-requests', icon: FiPackage, label: 'Stock Requests' },
    { path: '/hospitals', icon: HiOutlineBuildingOffice2, label: 'Hospitals' },
    { path: '/ai-predictions', icon: FiActivity, label: 'AI Predictions' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  ]
  
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <HiOutlineBuildingOffice2 />
            </div>
            <div className="logo-text">
              <span className="logo-title">SehatMitra</span>
              <span className="logo-subtitle">District Health Officer</span>
            </div>
          </div>
          <button className="close-btn mobile-only" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              end={item.path === '/'}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Officer'}</span>
              <span className="user-role">{user?.district || 'District'} DHO</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
      
      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <button className="menu-btn mobile-only" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-title">
            <h1>District Health Office Portal</h1>
            <p>{user?.district || 'Your District'}</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <FiSettings />
            </button>
          </div>
        </header>
        
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
