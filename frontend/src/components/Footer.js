import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Facebook, Twitter, Linkedin, Instagram, Youtube,
  Shield, Lock, Award, Smartphone
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img 
                src="/karetek-logo.png" 
                alt="Karetek" 
                className="logo-image"
              />
            </Link>
            <p className="footer-tagline">
              Your trusted AI doctor. Get expert medical guidance 24/7 with personalized 
              care plans in seconds. Secure, private, and always confidential.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="social-link">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Twitter" className="social-link">
                <Twitter size={18} />
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                <Linkedin size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="YouTube" className="social-link">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">AI Consultation</Link></li>
              <li><Link to="/health-metrics">Health Metrics</Link></li>
              <li><Link to="/consultations">My Consults</Link></li>
              <li><Link to="/health-records">Health Records</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
            <div className="footer-badges">
              <div className="cert-badge">
                <Shield size={16} />
                <span>Secure</span>
              </div>
              <div className="cert-badge">
                <Lock size={16} />
                <span>Encrypted</span>
              </div>
            </div>
          </div>

          {/* Mobile Apps Column */}
          <div className="footer-column">
            <h4>Download App</h4>
            <p className="footer-app-text">Get Karetek AI on your phone</p>
            <div className="footer-app-buttons">
              <a 
                href="https://apps.apple.com/ca/app/karetek-ai/id6759709900" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-app-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
                <span>App Store</span>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.karetek_medical_chat.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-app-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <span>Google Play</span>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <p>
            <strong>Always consult with a healthcare professional.</strong> Karetek is an AI 
            health assistant that provides general health information and wellness guidance. 
            It is not a substitute for professional medical advice, diagnosis, or treatment. 
            By using Karetek, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> &{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Karetek Health Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
