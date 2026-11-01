import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import AppointmentCard from '../components/AppointmentCard';
import './Dashboard.css';

/**
 * Dashboard page displays the user's appointments in a responsive grid.
 * Supports filtering by appointment status (SCHEDULED, CONFIRMED, etc.).
 * Shows loading spinner while fetching data and error messages on failure.
 */
const Dashboard = () => {
  // State for appointments list from API
  const [appointments, setAppointments] = useState([]);
  // Currently selected status filter (empty string means "all")
  const [statusFilter, setStatusFilter] = useState('');
  // Loading and error states for API call
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch appointments from the API on component mount.
   * Retrieves all appointments for the authenticated user.
   */
  useEffect(() => {
    fetchAppointments();
  }, []);

  /**
   * Fetch all appointments from the backend API
   */
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/appointments');
      // Handle both array response and paginated response formats
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter appointments based on the selected status.
   * If no filter is selected, return all appointments.
   */
  const filteredAppointments = statusFilter
    ? appointments.filter((apt) => apt.status === statusFilter)
    : appointments;

  /**
   * Count appointments by status for the filter badges
   * @param {string} status - The appointment status to count
   * @returns {number} Number of appointments with the given status
   */
  const countByStatus = (status) => {
    return appointments.filter((apt) => apt.status === status).length;
  };

  return (
    <div className="dashboard-page">
      {/* Page header with title and action button */}
      <div className="dashboard-header">
        <div>
          <h1>My Appointments</h1>
          <p className="dashboard-subtitle">
            Manage and track your upcoming appointments
          </p>
        </div>
        <Link to="/book-appointment" className="book-btn">
          + Book New Appointment
        </Link>
      </div>

      {/* Status filter buttons */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${statusFilter === '' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          All ({appointments.length})
        </button>
        <button
          className={`filter-btn filter-scheduled ${statusFilter === 'SCHEDULED' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('SCHEDULED')}
        >
          Scheduled ({countByStatus('SCHEDULED')})
        </button>
        <button
          className={`filter-btn filter-confirmed ${statusFilter === 'CONFIRMED' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('CONFIRMED')}
        >
          Confirmed ({countByStatus('CONFIRMED')})
        </button>
        <button
          className={`filter-btn filter-completed ${statusFilter === 'COMPLETED' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          Completed ({countByStatus('COMPLETED')})
        </button>
        <button
          className={`filter-btn filter-cancelled ${statusFilter === 'CANCELLED' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('CANCELLED')}
        >
          Cancelled ({countByStatus('CANCELLED')})
        </button>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={fetchAppointments} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Appointments grid or empty state */}
      {!loading && !error && (
        <>
          {filteredAppointments.length > 0 ? (
            <div className="appointments-grid">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">&#128197;</div>
              <h3>No appointments found</h3>
              <p>
                {statusFilter
                  ? `You have no ${statusFilter.toLowerCase()} appointments.`
                  : 'You haven\'t booked any appointments yet.'}
              </p>
              <Link to="/book-appointment" className="book-btn">
                Book Your First Appointment
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
