import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, User, LogOut, FileText, 
  Stethoscope, MessageSquare, Heart, ChevronDown,
  Shield, Lock, Calendar, Activity, ChevronRight
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Hamburger Menu Button */}
        <button 
          className="hamburger-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Spacer for minimal header */}
        <div style={{ flex: 1 }}></div>

        {/* Right Section */}
        <div className="header-right">

          {isAuthenticated ? (
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button 
                className="profile-button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="avatar avatar-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="profile-name desktop-only">
                  {user?.firstName}
                </span>
                <ChevronDown size={16} className={profileMenuOpen ? 'rotated' : ''} />
              </button>

              {profileMenuOpen && (
                <div className="profile-menu">
                    <div className="profile-menu-header">
                      <div className="avatar">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="profile-menu-name">{user?.firstName} {user?.lastName}</p>
                        <p className="profile-menu-email">{user?.email}</p>
                      </div>
                    </div>
                    <div className="profile-menu-divider" />
                    <Link to="/dashboard" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                      <User size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/health-records" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                      <FileText size={18} />
                      <span>Health Records</span>
                    </Link>
                    <div className="profile-menu-divider" />
                    <button className="profile-menu-item logout" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-minimal">
                Log In
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div className={`sidebar-menu ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
            <img 
              src="/karetek-logo.png" 
              alt="Karetek" 
              className="logo-image"
            />
          </Link>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Profile Section - Only for signed in users */}
        {isAuthenticated && user && (
          <div className="sidebar-user-section">
            <div className="sidebar-user-avatar">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="sidebar-user-email">
              {user.email}
            </div>
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div style={{ flex: 1 }}></div>

        {!isAuthenticated && (
          <div className="sidebar-cta">
            <Link 
              to="/register" 
              className="btn-sidebar-cta"
              onClick={() => setSidebarOpen(false)}
            >
              Join now free
            </Link>
            <p className="sidebar-cta-text">
              Join today to save your consults and access more features
            </p>
          </div>
        )}

        <div className="sidebar-footer">
          {!isAuthenticated ? (
            <>
              <Link 
                to="/login" 
                className="sidebar-footer-link"
                onClick={() => setSidebarOpen(false)}
              >
                <User size={16} />
                <span>Login</span>
              </Link>
              <div className="sidebar-hipaa">
                <Shield size={14} />
                <span>HIPAA Compliant · Private & Secure</span>
              </div>
            </>
          ) : (
            <>
              <button 
                className="sidebar-footer-link logout-link"
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
              <div className="sidebar-hipaa">
                <Shield size={14} />
                <span>HIPAA Compliant · Private & Secure</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare size={20} />
              <span>AI Consult</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/consultations" 
                  className={`mobile-nav-link ${isActive('/consultations') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Stethoscope size={20} />
                  <span>My Consults</span>
                </Link>
                <Link 
                  to="/health-records" 
                  className={`mobile-nav-link ${isActive('/health-records') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={20} />
                  <span>Health Records</span>
                </Link>
                <Link 
                  to="/health-metrics" 
                  className={`mobile-nav-link ${isActive('/health-metrics') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={20} />
                  <span>Health Metrics</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  <span>My Profile</span>
                </Link>
              </>
            )}

            <div className="mobile-nav-divider" />

            {!isAuthenticated && (
              <div className="mobile-auth">
                <Link 
                  to="/login" 
                  className="btn btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Free
                </Link>
              </div>
            )}

            <div className="mobile-hipaa">
              <Shield size={18} />
              <span>HIPAA Compliant · Your data is private and secure</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
