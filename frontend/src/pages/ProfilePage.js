import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../utils/api';
import { 
  User, Mail, Phone, MapPin, Calendar, Heart, Scale, 
  Ruler, Droplet, Activity, AlertCircle, Save, Edit2
} from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    bloodGroup: '',
    height: '',
    weight: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: [],
    allergies: [],
    currentMedications: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.get();
      setProfile(data.profile);
      setFormData({
        firstName: data.profile.first_name || '',
        lastName: data.profile.last_name || '',
        email: data.profile.email || '',
        dateOfBirth: data.profile.date_of_birth || '',
        gender: data.profile.gender || '',
        phoneNumber: data.profile.phone_number || '',
        address: data.profile.address || '',
        city: data.profile.city || '',
        state: data.profile.state || '',
        zipCode: data.profile.zip_code || '',
        country: data.profile.country || 'Pakistan',
        bloodGroup: data.profile.blood_group || '',
        height: data.profile.height || '',
        weight: data.profile.weight || '',
        emergencyContactName: data.profile.emergency_contact_name || '',
        emergencyContactPhone: data.profile.emergency_contact_phone || '',
        medicalConditions: data.profile.medical_conditions || [],
        allergies: data.profile.allergies || [],
        currentMedications: data.profile.current_medications || []
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileAPI.update(formData);
      await fetchProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="page-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const age = calculateAge(formData.dateOfBirth);
  const bmi = calculateBMI(formData.weight, formData.height);

  return (
    <div className="profile-page">
      <Header />
      
      <div className="page-container">
        {/* Header Section */}
        <div className="page-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal information and health details</p>
          </div>
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="button-group">
              <button className="btn btn-secondary" onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={saving}
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!isEditing && (
          <div className="profile-stats">
            {age && (
              <div className="stat-card">
                <Calendar size={24} />
                <div>
                  <h3>{age} years</h3>
                  <p>Age</p>
                </div>
              </div>
            )}
            {bmi && (
              <div className="stat-card">
                <Activity size={24} />
                <div>
                  <h3>{bmi}</h3>
                  <p>BMI</p>
                </div>
              </div>
            )}
            {formData.bloodGroup && (
              <div className="stat-card">
                <Droplet size={24} />
                <div>
                  <h3>{formData.bloodGroup}</h3>
                  <p>Blood Group</p>
                </div>
              </div>
            )}
            {formData.weight && (
              <div className="stat-card">
                <Scale size={24} />
                <div>
                  <h3>{formData.weight} kg</h3>
                  <p>Weight</p>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Information */}
          <div className="profile-section">
            <div className="section-header">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+92 XXX XXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="profile-section">
            <div className="section-header">
              <MapPin size={20} />
              <h2>Address Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="House #, Street name"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Zip/Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="profile-section">
            <div className="section-header">
              <Heart size={20} />
              <h2>Health Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="170"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="70"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group full-width">
                <label>Medical Conditions</label>
                <input
                  type="text"
                  value={formData.medicalConditions.join(', ')}
                  onChange={(e) => handleArrayInputChange('medicalConditions', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Separate multiple conditions with commas"
                />
                <small>e.g., Diabetes, Hypertension, Asthma</small>
              </div>
              <div className="form-group full-width">
                <label>Allergies</label>
                <input
                  type="text"
                  value={formData.allergies.join(', ')}
                  onChange={(e) => handleArrayInputChange('allergies', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Separate multiple allergies with commas"
                />
                <small>e.g., Penicillin, Peanuts, Pollen</small>
              </div>
              <div className="form-group full-width">
                <label>Current Medications</label>
                <input
                  type="text"
                  value={formData.currentMedications.join(', ')}
                  onChange={(e) => handleArrayInputChange('currentMedications', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Separate multiple medications with commas"
                />
                <small>e.g., Metformin 500mg, Aspirin 75mg</small>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="profile-section">
            <div className="section-header">
              <AlertCircle size={20} />
              <h2>Emergency Contact</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+92 XXX XXXXXXX"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
