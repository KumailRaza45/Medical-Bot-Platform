import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, User, LogOut, FileText, 
  Stethoscope, MessageSquare, Heart, ChevronDown,
  Shield, Lock
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img 
            src="/karetek-logo.png" 
            alt="Karetek" 
            className="logo-image"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>AI Consult</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/consultations" className={`nav-link ${isActive('/consultations') ? 'active' : ''}`}>
                <Stethoscope size={18} />
                <span>My Consults</span>
              </Link>
              <Link to="/health-records" className={`nav-link ${isActive('/health-records') ? 'active' : ''}`}>
                <FileText size={18} />
                <span>Health Records</span>
              </Link>
              <Link to="/health-metrics" className={`nav-link ${isActive('/health-metrics') ? 'active' : ''}`}>
                <Heart size={18} />
                <span>Health Metrics</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Section */}
        <div className="header-right">
          {/* HIPAA Badge */}
          <div className="hipaa-badge desktop-only">
            <Lock size={14} />
            <span>HIPAA · Private</span>
          </div>

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
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join Free
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
