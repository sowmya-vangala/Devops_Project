import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './EditAppointment.css';

/**
 * EditAppointment page allows users to modify an existing appointment.
 * Pre-populates the form with current appointment data fetched from the API.
 * Validates all fields before submitting the update request.
 */
const EditAppointment = () => {
  const { id } = useParams(); // Extract appointment ID from URL parameters
  const navigate = useNavigate();

  // Form field state
  const [formData, setFormData] = useState({
    serviceProviderId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  // List of service providers for the dropdown
  const [providers, setProviders] = useState([]);
  // Component state flags
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /**
   * Fetch the existing appointment data and provider list on mount.
   * Both requests run in parallel for better performance.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointment details and providers list concurrently
        const [appointmentRes, providersRes] = await Promise.all([
          axiosInstance.get(`/appointments/${id}`),
          axiosInstance.get('/providers'),
        ]);

        const appointment = appointmentRes.data;
        const providerData = Array.isArray(providersRes.data)
          ? providersRes.data
          : providersRes.data.content || [];

        setProviders(providerData.filter((p) => p.active !== false));

        // Pre-populate the form with existing appointment data
        setFormData({
          serviceProviderId: appointment.providerId || '',
          appointmentDate: appointment.appointmentDate || '',
          appointmentTime: appointment.appointmentTime
            ? appointment.appointmentTime.substring(0, 5)
            : '',
          reason: appointment.reason || '',
          notes: appointment.notes || '',
        });
      } catch (err) {
        setApiError('Failed to load appointment details. Please try again.');
        console.error('Error fetching appointment:', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /**
   * Get today's date in YYYY-MM-DD format for the date picker minimum
   */
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  /**
   * Handle input changes and clear relevant validation errors
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
   * Validate form fields before submitting the update.
   * Same validation rules as the booking form.
   * @returns {boolean} true if valid
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.serviceProviderId) {
      newErrors.serviceProviderId = 'Please select a service provider';
    }

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

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for appointment is required';
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason must not exceed 500 characters';
    }

    if (formData.notes.length > 1000) {
      newErrors.notes = 'Notes must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission - validate and update appointment via API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // Send PUT request to update the appointment
      await axiosInstance.put(`/appointments/${id}`, {
        providerId: parseInt(formData.serviceProviderId, 10),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
      });

      setSuccessMsg('Appointment updated successfully!');
      setTimeout(() => {
        navigate(`/appointments/${id}`);
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.detail || error.response.data.message || error.response.data.error || 'Failed to update appointment.');
      } else {
        setApiError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching initial data
  if (pageLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className="edit-appointment-page">
      <div className="form-card">
        {/* Page header */}
        <div className="form-header">
          <h1>Edit Appointment</h1>
          <p>Update the details of your appointment below</p>
        </div>

        {/* Error and success banners */}
        {apiError && <div className="error-banner">{apiError}</div>}
        {successMsg && <div className="success-banner">{successMsg}</div>}

        {/* Edit form - same structure as booking form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Service provider dropdown */}
          <div className="form-group">
            <label htmlFor="serviceProviderId">Service Provider *</label>
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
            {errors.serviceProviderId && (
              <span className="field-error">{errors.serviceProviderId}</span>
            )}
          </div>

          {/* Date and time fields in a row */}
          <div className="form-row">
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

          {/* Notes textarea */}
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
              onClick={() => navigate(`/appointments/${id}`)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-small"></span>
                  Updating...
                </span>
              ) : (
                'Update Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointment;
