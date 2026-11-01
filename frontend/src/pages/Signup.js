import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './Signup.css';

/**
 * Signup page component handles new user registration.
 * Performs comprehensive client-side validation including
 * password matching and email format verification.
 */
const Signup = () => {
  const navigate = useNavigate();

  // Form field state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  // API error message state
  const [apiError, setApiError] = useState('');
  // Success message state
  const [successMsg, setSuccessMsg] = useState('');
  // Loading state for submit button
  const [loading, setLoading] = useState(false);

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
   * Checks: required fields, length constraints, email format, password match.
   * @returns {boolean} true if all fields pass validation
   */
  const validateForm = () => {
    const newErrors = {};

    // Username validation: required, 3-50 characters
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 50) {
      newErrors.username = 'Username must not exceed 50 characters';
    }

    // Email validation: required, valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation: required, minimum 6 characters
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password: must match password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission - validate and send signup request to API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation before submitting
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // Send registration request to the backend
      await axiosInstance.post('/auth/signup', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Show success message and redirect to login after a delay
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Display specific error from API or fallback message
      if (error.response && error.response.data) {
        setApiError(error.response.data.detail || error.response.data.message || error.response.data.error || 'Registration failed. Please try again.');
      } else {
        setApiError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        {/* Header section */}
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join our secure appointment booking platform</p>
        </div>

        {/* API error banner */}
        {apiError && <div className="error-banner">{apiError}</div>}

        {/* Success message banner */}
        {successMsg && <div className="success-banner">{successMsg}</div>}

        {/* Registration form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username (3-50 characters)"
              className={errors.username ? 'input-error' : ''}
              disabled={loading}
              maxLength={50}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={errors.email ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              className={errors.password ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm password field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit button with loading state */}
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Link to login page */}
        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
