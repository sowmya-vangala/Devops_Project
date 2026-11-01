import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './AddProvider.css';

/**
 * AddProvider page allows admin users to register a new service provider.
 * Includes client-side validation for all required fields including
 * name, specialization, email, and phone format validation.
 */
const AddProvider = () => {
  const navigate = useNavigate();

  // Form field state for provider details
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    address: '',
    active: true,
  });

  // Validation errors, API error, success message, and loading states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle input changes and clear field-specific errors
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  /**
   * Validate all provider form fields.
   * Checks: required fields, length constraints, email and phone formats.
   * @returns {boolean} true if all fields pass validation
   */
  const validateForm = () => {
    const newErrors = {};

    // Name: required, 2-100 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

    // Specialization: required
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    // Email: required, valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone: required, valid format (allows common phone number patterns)
    const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission - validate and create provider via API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // Send POST request to create the new service provider
      await axiosInstance.post('/providers', {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        active: formData.active,
      });

      setSuccessMsg('Service provider added successfully!');
      setTimeout(() => {
        navigate('/providers');
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || error.response.data.error || 'Failed to add provider.');
      } else {
        setApiError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-provider-page">
      <div className="form-card">
        {/* Page header */}
        <div className="form-header">
          <h1>Add Service Provider</h1>
          <p>Register a new service provider in the system</p>
        </div>

        {/* Error and success banners */}
        {apiError && <div className="error-banner">{apiError}</div>}
        {successMsg && <div className="success-banner">{successMsg}</div>}

        {/* Provider registration form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Provider name */}
          <div className="form-group">
            <label htmlFor="name">Provider Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name of the provider (2-100 characters)"
              className={errors.name ? 'input-error' : ''}
              disabled={loading}
              maxLength={100}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Specialization */}
          <div className="form-group">
            <label htmlFor="specialization">Specialization *</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., General Practice, Dentistry, Physiotherapy"
              className={errors.specialization ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.specialization && (
              <span className="field-error">{errors.specialization}</span>
            )}
          </div>

          {/* Email and phone in a row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="provider@example.com"
                className={errors.email ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+44 123 456 7890"
                className={errors.phone ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          {/* Address (optional) */}
          <div className="form-group">
            <label htmlFor="address">Address (Optional)</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Office or clinic address"
              disabled={loading}
            />
          </div>

          {/* Active status checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Provider is active and accepting appointments</span>
            </label>
          </div>

          {/* Form action buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/providers')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-small"></span>
                  Adding...
                </span>
              ) : (
                'Add Provider'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProvider;
