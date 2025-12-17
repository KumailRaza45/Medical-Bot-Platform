import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  FileText, Pill, AlertCircle, Activity, Heart, Plus, 
  Edit2, Trash2, X, Check, Calendar, User, Shield
} from 'lucide-react';
import { healthRecordsAPI, healthMetricsAPI } from '../utils/api';
import './HealthRecordsPage.css';

const HealthRecordsPage = () => {
  const [activeTab, setActiveTab] = useState('medications');
  const [healthRecord, setHealthRecord] = useState(null);
  const [vitals, setVitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  useEffect(() => {
    fetchHealthRecords();
    fetchLatestVitals();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const data = await healthRecordsAPI.get();
      
      // Parse medications if they are JSON strings
      const medications = (data.current_medications || []).map(item => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch (e) {
            return item;
          }
        }
        return item;
      });

      // Parse allergies if they are JSON strings
      const allergies = (data.allergies || []).map(item => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch (e) {
            return item;
          }
        }
        return item;
      });

      // Parse conditions if they are JSON strings
      const conditions = (data.medical_conditions || []).map(item => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch (e) {
            return item;
          }
        }
        return item;
      });

      setHealthRecord({
        medications,
        allergies,
        conditions,
      });
    } catch (error) {
      console.error('Failed to fetch health records:', error);
      setHealthRecord({
        medications: [],
        allergies: [],
        conditions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestVitals = async () => {
    try {
      const metrics = await healthMetricsAPI.getAll();
      
      // Get latest metric for each type
      const latestVitals = {};
      
      ['blood_pressure', 'heart_rate', 'weight', 'blood_glucose', 'temperature', 'oxygen_saturation'].forEach(type => {
        const typeMetrics = metrics.metrics?.filter(m => m.metric_type === type) || [];
        if (typeMetrics.length > 0) {
          // Sort by recorded_at descending and get first
          const latest = typeMetrics.sort((a, b) => 
            new Date(b.recorded_at) - new Date(a.recorded_at)
          )[0];
          latestVitals[type] = latest;
        }
      });
      
      setVitals(latestVitals);
    } catch (error) {
      console.error('Failed to fetch vitals:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setIsEditing(true);
      setEditingId(item.id);
      setFormData(item);
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setFormData({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Edit existing item
        switch (modalType) {
          case 'medication':
            await healthRecordsAPI.updateMedication(editingId, formData);
            setHealthRecord(prev => ({
              ...prev,
              medications: prev.medications.map(m => m.id === editingId ? formData : m)
            }));
            break;
          case 'allergy':
            await healthRecordsAPI.updateAllergy(editingId, formData);
            setHealthRecord(prev => ({
              ...prev,
              allergies: prev.allergies.map(a => a.id === editingId ? formData : a)
            }));
            break;
          case 'condition':
            await healthRecordsAPI.updateCondition(editingId, formData);
            setHealthRecord(prev => ({
              ...prev,
              conditions: prev.conditions.map(c => c.id === editingId ? formData : c)
            }));
            break;
          default:
            break;
        }
        alert('Record updated successfully!');
      } else {
        // Add new item
        switch (modalType) {
          case 'medication':
            const medication = { ...formData, id: Date.now().toString() };
            await healthRecordsAPI.addMedication(medication);
            setHealthRecord(prev => ({
              ...prev,
              medications: [...(prev.medications || []), medication]
            }));
            break;
          case 'allergy':
            const allergy = { ...formData, id: Date.now().toString() };
            await healthRecordsAPI.addAllergy(allergy);
            setHealthRecord(prev => ({
              ...prev,
              allergies: [...(prev.allergies || []), allergy]
            }));
            break;
          case 'condition':
            const condition = { ...formData, id: Date.now().toString() };
            await healthRecordsAPI.addCondition(condition);
            setHealthRecord(prev => ({
              ...prev,
              conditions: [...(prev.conditions || []), condition]
            }));
            break;
          default:
            break;
        }
        alert('Record added successfully!');
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('Failed to save record. Please try again.');
    }
  };

  const handleDelete = async (type, id) => {
    setDeleteType(type);
    setDeleteItem(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      switch (deleteType) {
        case 'medication':
          await healthRecordsAPI.deleteMedication(deleteItem);
          setHealthRecord(prev => ({
            ...prev,
            medications: prev.medications.filter(m => m.id !== deleteItem)
          }));
          break;
        case 'allergy':
          await healthRecordsAPI.deleteAllergy(deleteItem);
          setHealthRecord(prev => ({
            ...prev,
            allergies: prev.allergies.filter(a => a.id !== deleteItem)
          }));
          break;
        case 'condition':
          await healthRecordsAPI.deleteCondition(deleteItem);
          setHealthRecord(prev => ({
            ...prev,
            conditions: prev.conditions.filter(c => c.id !== deleteItem)
          }));
          break;
        default:
          break;
      }
      alert('Record deleted successfully!');
      setShowDeleteModal(false);
      setDeleteItem(null);
      setDeleteType(null);
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
    setDeleteType(null);
  };

  const tabs = [
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'allergies', label: 'Allergies', icon: AlertCircle },
    { id: 'conditions', label: 'Conditions', icon: Activity },
    { id: 'vitals', label: 'Vitals', icon: Heart }
  ];

  const renderMedications = () => (
    <div className="records-section">
      <div className="section-header">
        <h3>Current Medications</h3>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('medication')}>
          <Plus size={16} />
          Add Medication
        </button>
      </div>

      {healthRecord?.medications?.length > 0 ? (
        <div className="records-grid">
          {healthRecord.medications.map(med => (
            <div key={med.id} className="record-card">
              <div className="record-icon medication">
                <Pill size={20} />
              </div>
              <div className="record-content">
                <h4>{med.name}</h4>
                <p className="record-detail">{med.dosage} - {med.frequency}</p>
                {med.prescribedBy && (
                  <p className="record-meta">Prescribed by: {med.prescribedBy}</p>
                )}
                {med.startDate && (
                  <p className="record-meta">Started: {new Date(med.startDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="record-actions">
                <button className="icon-btn" onClick={() => openModal('medication', med)}>
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete('medication', med.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-records">
          <Pill size={48} />
          <h4>No medications added</h4>
          <p>Keep track of your medications for better health management.</p>
          <button className="btn btn-primary" onClick={() => openModal('medication')}>
            <Plus size={18} />
            Add Your First Medication
          </button>
        </div>
      )}
    </div>
  );

  const renderAllergies = () => (
    <div className="records-section">
      <div className="section-header">
        <h3>Known Allergies</h3>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('allergy')}>
          <Plus size={16} />
          Add Allergy
        </button>
      </div>

      {healthRecord?.allergies?.length > 0 ? (
        <div className="records-grid">
          {healthRecord.allergies.map(allergy => (
            <div key={allergy.id} className="record-card">
              <div className="record-icon allergy">
                <AlertCircle size={20} />
              </div>
              <div className="record-content">
                <h4>{allergy.allergen}</h4>
                <p className="record-detail">Reaction: {allergy.reaction}</p>
                <span className={`severity-badge ${allergy.severity?.toLowerCase()}`}>
                  {allergy.severity}
                </span>
              </div>
              <div className="record-actions">
                <button className="icon-btn" onClick={() => openModal('allergy', allergy)}>
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete('allergy', allergy.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-records">
          <AlertCircle size={48} />
          <h4>No allergies recorded</h4>
          <p>Record your allergies to help doctors provide safer care.</p>
          <button className="btn btn-primary" onClick={() => openModal('allergy')}>
            <Plus size={18} />
            Add Allergy
          </button>
        </div>
      )}
    </div>
  );

  const renderConditions = () => (
    <div className="records-section">
      <div className="section-header">
        <h3>Medical Conditions</h3>
        <button className="btn btn-primary btn-sm" onClick={() => openModal('condition')}>
          <Plus size={16} />
          Add Condition
        </button>
      </div>

      {healthRecord?.conditions?.length > 0 ? (
        <div className="records-grid">
          {healthRecord.conditions.map(condition => (
            <div key={condition.id} className="record-card">
              <div className="record-icon condition">
                <Activity size={20} />
              </div>
              <div className="record-content">
                <h4>{condition.name}</h4>
                {condition.diagnosedDate && (
                  <p className="record-detail">
                    Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                  </p>
                )}
                <span className={`status-badge ${condition.status?.toLowerCase()}`}>
                  {condition.status}
                </span>
                {condition.notes && (
                  <p className="record-notes">{condition.notes}</p>
                )}
              </div>
              <div className="record-actions">
                <button className="icon-btn" onClick={() => openModal('condition', condition)}>
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete('condition', condition.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-records">
          <Activity size={48} />
          <h4>No conditions recorded</h4>
          <p>Track your medical conditions for comprehensive care.</p>
          <button className="btn btn-primary" onClick={() => openModal('condition')}>
            <Plus size={18} />
            Add Condition
          </button>
        </div>
      )}
    </div>
  );

  const renderVitals = () => (
    <div className="records-section">
      <div className="section-header">
        <h3>Health Vitals</h3>
        <p>Latest measurements from your health tracking</p>
      </div>

      <div className="vitals-grid">
        <div className="vital-card">
          <div className="vital-icon">
            <Heart size={24} />
          </div>
          <div className="vital-info">
            <span className="vital-label">Blood Pressure</span>
            <span className="vital-value">
              {vitals.blood_pressure ? `${vitals.blood_pressure.value} ${vitals.blood_pressure.unit}` : '--/-- mmHg'}
            </span>
            <span className="vital-date">
              {vitals.blood_pressure ? new Date(vitals.blood_pressure.recorded_at).toLocaleDateString() : 'No records'}
            </span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Activity size={24} />
          </div>
          <div className="vital-info">
            <span className="vital-label">Heart Rate</span>
            <span className="vital-value">
              {vitals.heart_rate ? `${vitals.heart_rate.value} ${vitals.heart_rate.unit}` : '-- bpm'}
            </span>
            <span className="vital-date">
              {vitals.heart_rate ? new Date(vitals.heart_rate.recorded_at).toLocaleDateString() : 'No records'}
            </span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <User size={24} />
          </div>
          <div className="vital-info">
            <span className="vital-label">Weight</span>
            <span className="vital-value">
              {vitals.weight ? `${vitals.weight.value} ${vitals.weight.unit}` : '-- kg'}
            </span>
            <span className="vital-date">
              {vitals.weight ? new Date(vitals.weight.recorded_at).toLocaleDateString() : 'No records'}
            </span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Heart size={24} />
          </div>
          <div className="vital-info">
            <span className="vital-label">Blood Glucose</span>
            <span className="vital-value">
              {vitals.blood_glucose ? `${vitals.blood_glucose.value} ${vitals.blood_glucose.unit}` : '-- mg/dL'}
            </span>
            <span className="vital-date">
              {vitals.blood_glucose ? new Date(vitals.blood_glucose.recorded_at).toLocaleDateString() : 'No records'}
            </span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Activity size={24} />
          </div>
          <div className="vital-info">
            <span className="vital-label">Temperature</span>
            <span className="vital-value">
              {vitals.temperature ? `${vitals.temperature.value} ${vitals.temperature.unit}` : '-- °F'}
            </span>
            <span className="vital-date">
              {vitals.temperature ? new Date(vitals.temperature.recorded_at).toLocaleDateString() : 'No records'}
            </span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Heart size={24} />
          </div>
          <div className="vital-info">
            <span className="vital-label">Oxygen Saturation</span>
            <span className="vital-value">
              {vitals.oxygen_saturation ? `${vitals.oxygen_saturation.value} ${vitals.oxygen_saturation.unit}` : '-- %'}
            </span>
            <span className="vital-date">
              {vitals.oxygen_saturation ? new Date(vitals.oxygen_saturation.recorded_at).toLocaleDateString() : 'No records'}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
        <Link to="/health-metrics" className="btn btn-secondary">
          View All Health Metrics →
        </Link>
      </div>
    </div>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case 'medication':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Medication Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Lisinopril"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dosage *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 10mg"
                  value={formData.dosage || ''}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency *</label>
                <select
                  className="form-input form-select"
                  value={formData.frequency || ''}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="As needed">As needed</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prescribed By</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Doctor's name"
                  value={formData.prescribedBy || ''}
                  onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Any additional notes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </>
        );

      case 'allergy':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Allergen *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Penicillin, Peanuts"
                value={formData.allergen || ''}
                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reaction *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Hives, Difficulty breathing"
                value={formData.reaction || ''}
                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Severity *</label>
              <select
                className="form-input form-select"
                value={formData.severity || ''}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                required
              >
                <option value="">Select severity</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Life-threatening">Life-threatening</option>
              </select>
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Condition Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Hypertension, Diabetes"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date Diagnosed</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.diagnosedDate || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosedDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-input form-select"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Managed">Managed</option>
                  <option value="Resolved">Resolved</option>
                  <option value="In remission">In remission</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Any additional notes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const action = isEditing ? 'Edit' : 'Add';
    switch (modalType) {
      case 'medication': return `${action} Medication`;
      case 'allergy': return `${action} Allergy`;
      case 'condition': return `${action} Condition`;
      case 'vital': return 'Record Vitals';
      default: return 'Add Record';
    }
  };

  return (
    <div className="health-records-page">
      <Header />

      <main className="records-main">
        <div className="records-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <h1>
                <FileText size={28} />
                Health Records
              </h1>
              <p>Manage your medical information securely in one place.</p>
            </div>
            <div className="hipaa-badge">
              <Shield size={16} />
              <span>HIPAA Secure</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="records-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {healthRecord && healthRecord[tab.id]?.length > 0 && (
                  <span className="tab-count">{healthRecord[tab.id].length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="records-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner spinner-lg"></div>
                <p>Loading your health records...</p>
              </div>
            ) : (
              <>
                {activeTab === 'medications' && renderMedications()}
                {activeTab === 'allergies' && renderAllergies()}
                {activeTab === 'conditions' && renderConditions()}
                {activeTab === 'vitals' && renderVitals()}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getModalTitle()}</h3>
              <button className="icon-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {renderModalContent()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <AlertCircle size={48} />
            </div>
            <h3>Delete {deleteType === 'medication' ? 'Medication' : deleteType === 'allergy' ? 'Allergy' : 'Condition'}?</h3>
            <p>Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HealthRecordsPage;
