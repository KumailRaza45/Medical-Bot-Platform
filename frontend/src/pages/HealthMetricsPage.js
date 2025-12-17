import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Activity, Heart, Droplet, Wind, TrendingUp,
  Plus, Trash2, Calendar, Clock, Save
} from 'lucide-react';
import { healthMetricsAPI } from '../utils/api';
import './HealthMetricsPage.css';

const HealthMetricsPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState({
    type: '',
    value: '',
    unit: '',
    date: new Date().toISOString().split('T')[0]
  });

  const metricTypes = [
    { name: 'Blood Pressure', unit: 'mmHg', icon: Activity, color: '#ef4444' },
    { name: 'Heart Rate', unit: 'bpm', icon: Heart, color: '#f97316' },
    { name: 'Blood Sugar', unit: 'mg/dL', icon: Droplet, color: '#3b82f6' },
    { name: 'Weight', unit: 'kg', icon: TrendingUp, color: '#8b5cf6' },
    { name: 'Temperature', unit: '°F', icon: Activity, color: '#ec4899' },
    { name: 'Oxygen Level', unit: '%', icon: Wind, color: '#14b8a6' },
  ];

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await healthMetricsAPI.getAll();
      // Map database format to display format
      const formattedMetrics = data.metrics.map(m => ({
        id: m.id,
        type: formatMetricType(m.metric_type),
        value: m.value,
        unit: m.unit,
        date: m.recorded_at.split('T')[0],
        notes: m.notes,
        status: 'normal' // You can add logic to determine status
      }));
      setMetrics(formattedMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMetricType = (dbType) => {
    const typeMap = {
      'blood_pressure': 'Blood Pressure',
      'heart_rate': 'Heart Rate',
      'blood_sugar': 'Blood Sugar',
      'weight': 'Weight',
      'temperature': 'Temperature',
      'oxygen_level': 'Oxygen Level'
    };
    return typeMap[dbType] || dbType;
  };

  const formatMetricTypeForDB = (displayType) => {
    const typeMap = {
      'Blood Pressure': 'blood_pressure',
      'Heart Rate': 'heart_rate',
      'Blood Sugar': 'blood_sugar',
      'Weight': 'weight',
      'Temperature': 'temperature',
      'Oxygen Level': 'oxygen_level'
    };
    return typeMap[displayType] || displayType.toLowerCase().replace(' ', '_');
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    try {
      await healthMetricsAPI.add({
        metricType: formatMetricTypeForDB(newMetric.type),
        value: newMetric.value,
        unit: newMetric.unit,
        recordedAt: newMetric.date
      });
      setNewMetric({ type: '', value: '', unit: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
      fetchMetrics(); // Refresh the list
    } catch (error) {
      console.error('Failed to add metric:', error);
      alert('Failed to add metric. Please try again.');
    }
  };

  const handleDeleteMetric = async (id) => {
    if (!window.confirm('Are you sure you want to delete this metric?')) {
      return;
    }
    try {
      await healthMetricsAPI.delete(id);
      fetchMetrics(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete metric:', error);
      alert('Failed to delete metric. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="health-metrics-page">
      <Header />
      
      <div className="page-container">
        {/* Header Section */}
        <div className="page-header">
          <div>
            <h1>Health Metrics</h1>
            <p>Track and monitor your vital health measurements</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Add Metric
          </button>
        </div>

        {/* Quick Stats */}
        <div className="metrics-stats">
          {loading ? (
            <div className="loading-state">Loading metrics...</div>
          ) : (
            metricTypes.slice(0, 4).map((type, idx) => {
              const latestMetric = metrics.find(m => m.type === type.name);
              const Icon = type.icon;
              return (
                <div key={idx} className="stat-card" style={{ borderLeftColor: type.color }}>
                  <div className="stat-icon" style={{ background: `${type.color}15` }}>
                    <Icon size={24} style={{ color: type.color }} />
                  </div>
                  <div className="stat-info">
                    <h3>{type.name}</h3>
                    <div className="stat-value">
                      {latestMetric ? (
                        <>
                          <span className="value">{latestMetric.value}</span>
                          <span className="unit">{latestMetric.unit}</span>
                        </>
                      ) : (
                        <span className="no-data">No data</span>
                      )}
                    </div>
                    {latestMetric && (
                      <span className="stat-date">
                        <Clock size={14} />
                        {new Date(latestMetric.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Metric Form */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Health Metric</h2>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              <form onSubmit={handleAddMetric}>
                <div className="form-group">
                  <label>Metric Type *</label>
                  <select
                    value={newMetric.type}
                    onChange={(e) => {
                      const selected = metricTypes.find(t => t.name === e.target.value);
                      setNewMetric({
                        ...newMetric,
                        type: e.target.value,
                        unit: selected?.unit || ''
                      });
                    }}
                    required
                  >
                    <option value="">Select metric type</option>
                    {metricTypes.map((type, idx) => (
                      <option key={idx} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Value *</label>
                    <input
                      type="text"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                      placeholder={
                        newMetric.type === 'Blood Pressure' ? 'e.g., 120/80' :
                        newMetric.type === 'Heart Rate' ? 'e.g., 72' :
                        newMetric.type === 'Blood Sugar' ? 'e.g., 95' :
                        newMetric.type === 'Weight' ? 'e.g., 70' :
                        newMetric.type === 'Temperature' ? 'e.g., 98.6' :
                        newMetric.type === 'Oxygen Level' ? 'e.g., 98' :
                        'Enter value'
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <input
                      type="text"
                      value={newMetric.unit}
                      onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                      placeholder={newMetric.unit || 'Unit'}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={newMetric.date}
                    onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} />
                    Save Metric
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Metrics History */}
        <div className="metrics-section">
          <h2>Recent Measurements</h2>
          <div className="metrics-list">
            {metrics.length === 0 ? (
              <div className="empty-state">
                <Activity size={48} />
                <h3>No metrics recorded yet</h3>
                <p>Start tracking your health by adding your first measurement</p>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                  <Plus size={20} />
                  Add Your First Metric
                </button>
              </div>
            ) : (
              metrics.map((metric) => {
                const metricType = metricTypes.find(t => t.name === metric.type);
                const Icon = metricType?.icon || Activity;
                return (
                  <div key={metric.id} className="metric-item">
                    <div className="metric-icon" style={{ background: `${metricType?.color}15` }}>
                      <Icon size={20} style={{ color: metricType?.color }} />
                    </div>
                    <div className="metric-details">
                      <h3>{metric.type}</h3>
                      <div className="metric-value">
                        <span className="value">{metric.value}</span>
                        <span className="unit">{metric.unit}</span>
                      </div>
                      <span className="metric-date">
                        <Calendar size={14} />
                        {new Date(metric.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="metric-status">
                      <span 
                        className="status-badge" 
                        style={{ background: `${getStatusColor(metric.status)}15`, color: getStatusColor(metric.status) }}
                      >
                        {metric.status}
                      </span>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteMetric(metric.id)}
                      title="Delete metric"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="health-tips">
          <h2>Health Tracking Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">📊</div>
              <h3>Track Regularly</h3>
              <p>Consistent tracking helps identify patterns and trends in your health</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⏰</div>
              <h3>Same Time Daily</h3>
              <p>Measure at the same time each day for more accurate comparisons</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">💬</div>
              <h3>Share with Karetek</h3>
              <p>Discuss your metrics with our AI for personalized health insights</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📱</div>
              <h3>Stay Informed</h3>
              <p>Understanding your numbers empowers better health decisions</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HealthMetricsPage;
