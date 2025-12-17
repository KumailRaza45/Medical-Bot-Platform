import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Facebook, Twitter, Linkedin, Instagram, Youtube,
  Shield, Lock, Award
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
              care plans in seconds. HIPAA compliant and always private.
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

          {/* Services Column */}
          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><Link to="/">AI Health Consultation</Link></li>
              <li><Link to="/health-metrics">Health Metrics Tracking</Link></li>
              <li><Link to="/consultations">My Consults</Link></li>
              <li><Link to="/health-records">Health Records</Link></li>
              <li><Link to="/">Symptom Checker</Link></li>
              <li><Link to="/">Medication Info</Link></li>
              <li><Link to="/">Health Tips</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="footer-column">
            <h4>Health Information</h4>
            <ul>
              <li><Link to="/">Health Blog</Link></li>
              <li><Link to="/">Conditions & Diseases</Link></li>
              <li><Link to="/">Lifestyle & Wellness</Link></li>
              <li><Link to="/">Family Health</Link></li>
              <li><Link to="/">Treatments</Link></li>
              <li><Link to="/">Symptoms Guide</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">Careers</Link></li>
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">FAQ</Link></li>
              <li><Link to="/">Feedback</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h4>Legal & Certifications</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/">HIPAA Compliance</Link></li>
              <li><Link to="/">LegitScript Certified</Link></li>
            </ul>
            <div className="footer-badges">
              <div className="cert-badge">
                <Shield size={16} />
                <span>HIPAA</span>
              </div>
              <div className="cert-badge">
                <Lock size={16} />
                <span>Encrypted</span>
              </div>
              <div className="cert-badge">
                <Award size={16} />
                <span>LegitScript</span>
              </div>
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
