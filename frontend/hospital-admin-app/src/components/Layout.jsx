import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FiHome, FiPackage, FiUsers, 
  FiMenu, FiX, FiLogOut, FiUser, FiSettings, FiBox
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { BiBed } from 'react-icons/bi'
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
    { path: '/beds', icon: BiBed, label: 'Bed Management' },
    { path: '/doctors', icon: FiUsers, label: 'Doctor Rotation' },
    { path: '/inventory', icon: FiBox, label: 'Inventory' },
    { path: '/stock-requests', icon: FiPackage, label: 'Stock Requests' },
  ]
  
  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <HiOutlineBuildingOffice2 />
            </div>
            <div className="logo-text">
              <span className="logo-title">SehatMitra</span>
              <span className="logo-subtitle">Hospital Admin</span>
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
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-role">Hospital Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
      
      <main className="main-content">
        <header className="top-header">
          <button className="menu-btn mobile-only" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-title">
            <h1>Hospital Management System</h1>
            <p>{user?.hospitalName || 'Your Hospital'}</p>
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
