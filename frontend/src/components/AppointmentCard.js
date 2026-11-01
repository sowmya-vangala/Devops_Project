import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentCard.css';

/**
 * AppointmentCard component displays a summary of an appointment.
 * Each card is color-coded based on appointment status.
 * Clicking the card navigates to the full appointment detail view.
 *
 * @param {object} appointment - The appointment data to display
 */
const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();

  /**
   * Map appointment status to a CSS class for colour coding.
   * SCHEDULED=blue, CONFIRMED=green, CANCELLED=grey, COMPLETED=purple
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'status-scheduled';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return 'status-scheduled';
    }
  };

  /**
   * Format date string to a user-friendly format
   * @param {string} dateStr - ISO date string (YYYY-MM-DD)
   * @returns {string} Formatted date (e.g., "24 Mar 2026")
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Format time string from HH:mm:ss or HH:mm to a readable format
   * @param {string} timeStr - Time string
   * @returns {string} Formatted time (e.g., "14:30")
   */
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    // Return only HH:mm portion
    return timeStr.substring(0, 5);
  };

  return (
    <div
      className={`appointment-card ${getStatusClass(appointment.status)}`}
      onClick={() => navigate(`/appointments/${appointment.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/appointments/${appointment.id}`);
      }}
    >
      {/* Status badge displayed at the top-right corner */}
      <div className="card-status-badge">
        {appointment.status}
      </div>

      {/* Provider name as card title */}
      <h3 className="card-title">
        {appointment.providerName || appointment.serviceProviderName || 'Provider'}
      </h3>

      {/* Appointment date and time */}
      <div className="card-info">
        <span className="card-label">Date:</span>
        <span className="card-value">{formatDate(appointment.appointmentDate)}</span>
      </div>
      <div className="card-info">
        <span className="card-label">Time:</span>
        <span className="card-value">{formatTime(appointment.appointmentTime)}</span>
      </div>

      {/* Reason for appointment (truncated if too long) */}
      <div className="card-reason">
        <span className="card-label">Reason:</span>
        <p className="card-reason-text">
          {appointment.reason
            ? appointment.reason.length > 80
              ? appointment.reason.substring(0, 80) + '...'
              : appointment.reason
            : 'No reason specified'}
        </p>
      </div>

      {/* Click hint */}
      <div className="card-footer">
        Click to view details
      </div>
    </div>
  );
};

export default AppointmentCard;
