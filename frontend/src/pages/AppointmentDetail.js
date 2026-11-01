import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useToast } from '../components/Toast';
import './AppointmentDetail.css';

/**
 * AppointmentDetail page displays the full information for a single appointment.
 * Provides actions to edit, cancel, or mark an appointment as completed.
 * Shows provider information and appointment metadata.
 */
const AppointmentDetail = () => {
  const { id } = useParams(); // Extract appointment ID from URL
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Appointment data from API
  const [appointment, setAppointment] = useState(null);
  // Loading, error, and action states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Fetch appointment details from the API on mount
   */
  useEffect(() => {
    fetchAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Fetch the appointment by ID from the backend
   */
  const fetchAppointment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/appointments/${id}`);
      setAppointment(response.data);
    } catch (err) {
      setError('Failed to load appointment details.');
      console.error('Error fetching appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel the appointment by sending a DELETE or status update request.
   * Asks the user for confirmation before proceeding.
   */
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setActionLoading(true);
    try {
      // Try updating status to CANCELLED first, fall back to DELETE
      await axiosInstance.put(`/appointments/${id}`, {
        ...appointment,
        status: 'CANCELLED',
      });
      addToast('Appointment cancelled successfully.', 'success');
      setSuccessMsg('Appointment cancelled successfully.');
      // Refresh the appointment data to reflect the new status
      await fetchAppointment();
    } catch (err) {
      // Fallback: try DELETE endpoint
      try {
        await axiosInstance.delete(`/appointments/${id}`);
        addToast('Appointment cancelled successfully.', 'success');
      setSuccessMsg('Appointment cancelled successfully.');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (deleteErr) {
        addToast('Failed to cancel appointment. Please try again.', 'error');
        setError('Failed to cancel appointment.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Mark the appointment as completed by updating its status
   */
  const handleComplete = async () => {
    if (!window.confirm('Mark this appointment as completed?')) {
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.put(`/appointments/${id}`, {
        ...appointment,
        status: 'COMPLETED',
      });
      addToast('Appointment marked as completed.', 'success');
      setSuccessMsg('Appointment marked as completed.');
      await fetchAppointment();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to complete appointment.';
      addToast(errMsg, 'error', 5000);
      setError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Format a date string to a human-readable format
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Format a time string to HH:mm
   */
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr.substring(0, 5);
  };

  /**
   * Get CSS class for status badge colouring
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'detail-status-scheduled';
      case 'CONFIRMED': return 'detail-status-confirmed';
      case 'CANCELLED': return 'detail-status-cancelled';
      case 'COMPLETED': return 'detail-status-completed';
      default: return 'detail-status-scheduled';
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  // Show error state
  if (error && !appointment) {
    return (
      <div className="detail-page">
        <div className="error-banner">{error}</div>
        <Link to="/dashboard" className="back-link">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Back navigation link */}
      <Link to="/dashboard" className="back-link">
        &larr; Back to Dashboard
      </Link>

      {/* Success/error messages */}
      {successMsg && <div className="success-banner">{successMsg}</div>}
      {error && <div className="error-banner">{error}</div>}

      {appointment && (
        <div className="detail-card">
          {/* Appointment header with status */}
          <div className="detail-header">
            <h1>Appointment Details</h1>
            <span className={`detail-status-badge ${getStatusClass(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>

          {/* Appointment information grid */}
          <div className="detail-grid">
            {/* Provider information section */}
            <div className="detail-section">
              <h2>Provider Information</h2>
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value">
                  {appointment.providerName || appointment.serviceProviderName || 'N/A'}
                </span>
              </div>
              {appointment.providerSpecialization && (
                <div className="detail-row">
                  <span className="detail-label">Specialization:</span>
                  <span className="detail-value">{appointment.providerSpecialization}</span>
                </div>
              )}
              {appointment.providerEmail && (
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{appointment.providerEmail}</span>
                </div>
              )}
              {appointment.providerPhone && (
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{appointment.providerPhone}</span>
                </div>
              )}
            </div>

            {/* Appointment details section */}
            <div className="detail-section">
              <h2>Appointment Information</h2>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(appointment.appointmentDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{formatTime(appointment.appointmentTime)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{appointment.status}</span>
              </div>
              {appointment.createdAt && (
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(appointment.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reason and notes - full width */}
          <div className="detail-section">
            <h2>Reason</h2>
            <p className="detail-text">{appointment.reason || 'No reason provided'}</p>
          </div>

          {appointment.notes && (
            <div className="detail-section">
              <h2>Additional Notes</h2>
              <p className="detail-text">{appointment.notes}</p>
            </div>
          )}

          {/* Action buttons - only show relevant actions based on status */}
          <div className="detail-actions">
            {/* Edit button - only for SCHEDULED or CONFIRMED appointments */}
            {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
              <Link to={`/edit-appointment/${appointment.id}`} className="action-btn edit-action-btn">
                Edit Appointment
              </Link>
            )}

            {/* Complete button - only for SCHEDULED or CONFIRMED */}
            {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
              <button
                onClick={handleComplete}
                className="action-btn complete-action-btn"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Mark as Completed'}
              </button>
            )}

            {/* Cancel button - only for SCHEDULED or CONFIRMED */}
            {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
              <button
                onClick={handleCancel}
                className="action-btn cancel-action-btn"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Cancel Appointment'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;
