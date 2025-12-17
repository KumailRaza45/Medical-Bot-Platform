import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Calendar, Video, Clock, Star, ChevronLeft, ChevronRight,
  Check, X, User, Globe, CreditCard, Shield
} from 'lucide-react';
import { appointmentsAPI, doctorsAPI } from '../utils/api';
import './AppointmentsPage.css';

const AppointmentsPage = () => {
  const [view, setView] = useState('book'); // 'book' or 'upcoming'
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        doctorsAPI.getAll(),
        appointmentsAPI.getAll().catch(() => ({ appointments: [] }))
      ]);
      setDoctors(doctorsRes.doctors || []);
      setAppointments(appointmentsRes.appointments || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    try {
      const response = await appointmentsAPI.getSlots(date.toISOString());
      setAvailableSlots(response.slots || []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    try {
      const response = await appointmentsAPI.book({
        dateTime: selectedTime,
        type: 'video',
        reason,
        doctorPreference: selectedDoctor.id
      });
      setBookedAppointment(response.appointment);
      setBookingComplete(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await appointmentsAPI.cancel(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const renderDoctorSelection = () => (
    <div className="booking-step">
      <h2>Select a Doctor</h2>
      <p>Choose from our network of licensed physicians</p>

      <div className="doctors-grid">
        {doctors.map(doctor => (
          <div 
            key={doctor.id}
            className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
            onClick={() => setSelectedDoctor(doctor)}
          >
            {selectedDoctor?.id === doctor.id && (
              <div className="selected-badge">
                <Check size={14} />
              </div>
            )}
            <div className="doctor-avatar">
              {doctor.name.includes('Sarah') ? '👩‍⚕️' : 
               doctor.name.includes('Emily') ? '👩‍⚕️' : '👨‍⚕️'}
            </div>
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p className="doctor-specialty">{doctor.specialty}</p>
              <div className="doctor-rating">
                <Star size={14} fill="currentColor" />
                <span>{doctor.rating}</span>
                <span className="review-count">({doctor.reviews} reviews)</span>
              </div>
              <div className="doctor-details">
                <span><Clock size={14} /> {doctor.experience}</span>
                <span><Globe size={14} /> {doctor.languages?.join(', ')}</span>
              </div>
              <div className="doctor-availability">
                <span className="available-badge">
                  Available {doctor.nextAvailable}
                </span>
                <span className="doctor-price">${doctor.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary btn-lg"
          disabled={!selectedDoctor}
          onClick={() => setStep(2)}
        >
          Continue
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="booking-step">
      <button className="back-btn" onClick={() => setStep(1)}>
        <ChevronLeft size={18} />
        Back to doctors
      </button>

      <h2>Select Date & Time</h2>
      <p>Choose a convenient time for your video visit</p>

      <div className="selected-doctor-preview">
        <div className="doctor-avatar small">
          {selectedDoctor?.name.includes('Sarah') ? '👩‍⚕️' : 
           selectedDoctor?.name.includes('Emily') ? '👩‍⚕️' : '👨‍⚕️'}
        </div>
        <div>
          <h4>{selectedDoctor?.name}</h4>
          <p>{selectedDoctor?.specialty}</p>
        </div>
      </div>

      <div className="date-selector">
        <h3>Select Date</h3>
        <div className="dates-scroll">
          {generateDates().map((date, index) => (
            <button
              key={index}
              className={`date-btn ${selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''}`}
              onClick={() => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
            >
              <span className="day-name">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="day-number">
                {date.getDate()}
              </span>
              <span className="month-name">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="time-selector">
          <h3>Available Times</h3>
          <div className="times-grid">
            {availableSlots.filter(slot => slot.available).length > 0 ? (
              availableSlots.filter(slot => slot.available).map(slot => (
                <button
                  key={slot.id}
                  className={`time-btn ${selectedTime === slot.time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(slot.time)}
                >
                  {formatTime(slot.time)}
                </button>
              ))
            ) : (
              <p className="no-slots">No available slots for this date. Please select another date.</p>
            )}
          </div>
        </div>
      )}

      <div className="step-actions">
        <button 
          className="btn btn-primary btn-lg"
          disabled={!selectedTime}
          onClick={() => setStep(3)}
        >
          Continue
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="booking-step">
      <button className="back-btn" onClick={() => setStep(2)}>
        <ChevronLeft size={18} />
        Back to time selection
      </button>

      <h2>Confirm Your Appointment</h2>
      <p>Review your booking details before confirming</p>

      <div className="booking-summary">
        <div className="summary-card">
          <div className="summary-doctor">
            <div className="doctor-avatar">
              {selectedDoctor?.name.includes('Sarah') ? '👩‍⚕️' : 
               selectedDoctor?.name.includes('Emily') ? '👩‍⚕️' : '👨‍⚕️'}
            </div>
            <div>
              <h3>{selectedDoctor?.name}</h3>
              <p>{selectedDoctor?.specialty}</p>
            </div>
          </div>

          <div className="summary-details">
            <div className="summary-item">
              <Calendar size={18} />
              <span>{selectedDate && formatDate(selectedDate)}</span>
            </div>
            <div className="summary-item">
              <Clock size={18} />
              <span>{selectedTime && formatTime(selectedTime)}</span>
            </div>
            <div className="summary-item">
              <Video size={18} />
              <span>Video Visit</span>
            </div>
          </div>

          <div className="summary-price">
            <span>Total</span>
            <span className="price">${selectedDoctor?.price || 39}</span>
          </div>
        </div>

        <div className="reason-input">
          <label>Reason for visit (optional)</label>
          <textarea
            placeholder="Briefly describe your symptoms or concerns..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="payment-info">
          <CreditCard size={18} />
          <span>Payment will be collected at the time of your visit</span>
        </div>

        <div className="hipaa-notice">
          <Shield size={18} />
          <span>Your visit is HIPAA-compliant and completely private</span>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary btn-lg"
          onClick={handleBookAppointment}
        >
          <Check size={18} />
          Confirm Appointment
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="booking-success">
      <div className="success-icon">
        <Check size={40} />
      </div>
      <h2>Appointment Confirmed!</h2>
      <p>Your video visit has been scheduled successfully.</p>

      <div className="success-details">
        <div className="success-card">
          <div className="success-doctor">
            <div className="doctor-avatar">
              {bookedAppointment?.doctor?.name.includes('Sarah') ? '👩‍⚕️' : 
               bookedAppointment?.doctor?.name.includes('Emily') ? '👩‍⚕️' : '👨‍⚕️'}
            </div>
            <div>
              <h3>{bookedAppointment?.doctor?.name}</h3>
              <p>{bookedAppointment?.doctor?.specialty}</p>
            </div>
          </div>
          <div className="success-info">
            <p><Calendar size={16} /> {bookedAppointment?.dateTime && 
              new Date(bookedAppointment.dateTime).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}</p>
            <p><Clock size={16} /> {bookedAppointment?.dateTime && 
              formatTime(bookedAppointment.dateTime)}</p>
            <p><Video size={16} /> Video Visit</p>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <button 
          className="btn btn-primary"
          onClick={() => {
            setBookingComplete(false);
            setStep(1);
            setSelectedDoctor(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setReason('');
            setView('upcoming');
            fetchData();
          }}
        >
          View My Appointments
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setBookingComplete(false);
            setStep(1);
            setSelectedDoctor(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setReason('');
          }}
        >
          Book Another
        </button>
      </div>
    </div>
  );

  const renderUpcomingAppointments = () => (
    <div className="upcoming-appointments">
      <h2>Your Appointments</h2>
      
      {appointments.length > 0 ? (
        <div className="appointments-list">
          {appointments.map(apt => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-left">
                <div className="appointment-avatar">
                  <Video size={24} />
                </div>
                <div className="appointment-info">
                  <h3>{apt.doctor?.name}</h3>
                  <p>{apt.doctor?.specialty}</p>
                  <div className="appointment-meta">
                    <span><Calendar size={14} /> {new Date(apt.dateTime).toLocaleDateString()}</span>
                    <span><Clock size={14} /> {formatTime(apt.dateTime)}</span>
                  </div>
                </div>
              </div>
              <div className="appointment-right">
                <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                <div className="appointment-actions">
                  {apt.videoLink && (
                    <a href={apt.videoLink} className="btn btn-primary btn-sm">
                      Join Video
                    </a>
                  )}
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleCancelAppointment(apt.id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-appointments">
          <Calendar size={48} />
          <h3>No upcoming appointments</h3>
          <p>Book a video visit with a licensed doctor.</p>
          <button className="btn btn-primary" onClick={() => setView('book')}>
            Book Appointment
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="appointments-page">
      <Header />

      <main className="appointments-main">
        <div className="appointments-container">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1>
                <Video size={28} />
                Video Appointments
              </h1>
              <p>Book a video visit with a licensed doctor</p>
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${view === 'book' ? 'active' : ''}`}
                onClick={() => setView('book')}
              >
                Book New
              </button>
              <button 
                className={`toggle-btn ${view === 'upcoming' ? 'active' : ''}`}
                onClick={() => setView('upcoming')}
              >
                My Appointments
                {appointments.length > 0 && (
                  <span className="badge">{appointments.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="appointments-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner spinner-lg"></div>
                <p>Loading...</p>
              </div>
            ) : view === 'book' ? (
              bookingComplete ? renderSuccess() : (
                <>
                  {/* Progress Steps */}
                  <div className="booking-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                      <div className="step-number">1</div>
                      <span>Select Doctor</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                      <div className="step-number">2</div>
                      <span>Date & Time</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                      <div className="step-number">3</div>
                      <span>Confirm</span>
                    </div>
                  </div>

                  {/* Booking Steps */}
                  {step === 1 && renderDoctorSelection()}
                  {step === 2 && renderDateTimeSelection()}
                  {step === 3 && renderConfirmation()}
                </>
              )
            ) : (
              renderUpcomingAppointments()
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentsPage;
