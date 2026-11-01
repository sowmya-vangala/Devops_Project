import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useToast } from '../components/Toast';
import './BookAppointment.css';

/**
 * BookAppointment page allows users to create a new appointment.
 * Users select a service provider, date, time, and provide a reason.
 * Includes client-side validation for all required fields.
 */
const BookAppointment = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Form field state
  const [formData, setFormData] = useState({
    serviceProviderId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  // List of available service providers for the dropdown
  const [providers, setProviders] = useState([]);
  // Validation errors, API error, success message, and loading states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(true);

  /**
   * Fetch the list of active service providers on mount.
   * These populate the provider selection dropdown.
   */
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axiosInstance.get('/providers');
        const data = Array.isArray(response.data) ? response.data : response.data.content || [];
        // Filter to only show active providers
        const activeProviders = data.filter((p) => p.active !== false);
        setProviders(activeProviders);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setApiError('Failed to load service providers.');
      } finally {
        setProvidersLoading(false);
      }
    };
    fetchProviders();
  }, []);

  /**
   * Get today's date in YYYY-MM-DD format for the date picker minimum value.
   * Ensures users cannot select past dates.
   */
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  /**
   * Handle input field changes and clear field-specific errors
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  /**
   * Validate all form fields before submission.
   * Checks required fields, date constraints, and character limits.
   * @returns {boolean} true if all fields pass validation
   */
  const validateForm = () => {
    const newErrors = {};

    // Service provider is required
    if (!formData.serviceProviderId) {
      newErrors.serviceProviderId = 'Please select a service provider';
    }

    // Appointment date: required and must be today or in the future
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.appointmentDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date must be today or in the future';
      }
    }

    // Appointment time is required
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    }

    // Reason: required, max 500 characters
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for appointment is required';
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason must not exceed 500 characters';
    }

    // Notes: optional, max 1000 characters
    if (formData.notes.length > 1000) {
      newErrors.notes = 'Notes must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission - validate and create new appointment via API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // Send appointment creation request to the backend
      await axiosInstance.post('/appointments', {
        providerId: parseInt(formData.serviceProviderId, 10),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
      });

      // Show success toast and redirect to dashboard
      addToast('Appointment booked successfully!', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to book appointment.';
      addToast(msg, 'error', 5000);
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-appointment-page">
      <div className="form-card">
        {/* Page header */}
        <div className="form-header">
          <h1>Book an Appointment</h1>
          <p>Fill in the details below to schedule your appointment</p>
        </div>

        {/* Error and success banners */}
        {apiError && <div className="error-banner">{apiError}</div>}
        {successMsg && <div className="success-banner">{successMsg}</div>}

        {/* Booking form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Service provider dropdown */}
          <div className="form-group">
            <label htmlFor="serviceProviderId">Service Provider *</label>
            {providersLoading ? (
              <p className="loading-text">Loading providers...</p>
            ) : (
              <select
                id="serviceProviderId"
                name="serviceProviderId"
                value={formData.serviceProviderId}
                onChange={handleChange}
                className={errors.serviceProviderId ? 'input-error' : ''}
                disabled={loading}
              >
                <option value="">-- Select a Provider --</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} - {provider.specialization}
                  </option>
                ))}
              </select>
            )}
            {errors.serviceProviderId && (
              <span className="field-error">{errors.serviceProviderId}</span>
            )}
          </div>

          {/* Date and time fields in a row */}
          <div className="form-row">
            {/* Appointment date picker - restricts past dates */}
            <div className="form-group">
              <label htmlFor="appointmentDate">Date *</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={getTodayDate()}
                className={errors.appointmentDate ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.appointmentDate && (
                <span className="field-error">{errors.appointmentDate}</span>
              )}
            </div>

            {/* Appointment time picker */}
            <div className="form-group">
              <label htmlFor="appointmentTime">Time *</label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className={errors.appointmentTime ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.appointmentTime && (
                <span className="field-error">{errors.appointmentTime}</span>
              )}
            </div>
          </div>

          {/* Reason textarea */}
          <div className="form-group">
            <label htmlFor="reason">Reason for Appointment *</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Describe the reason for your appointment"
              rows={3}
              className={errors.reason ? 'input-error' : ''}
              disabled={loading}
              maxLength={500}
            />
            <span className="char-count">{formData.reason.length}/500</span>
            {errors.reason && <span className="field-error">{errors.reason}</span>}
          </div>

          {/* Notes textarea (optional) */}
          <div className="form-group">
            <label htmlFor="notes">Additional Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information or special requests"
              rows={3}
              className={errors.notes ? 'input-error' : ''}
              disabled={loading}
              maxLength={1000}
            />
            <span className="char-count">{formData.notes.length}/1000</span>
            {errors.notes && <span className="field-error">{errors.notes}</span>}
          </div>

          {/* Form action buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-small"></span>
                  Booking...
                </span>
              ) : (
                'Book Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
