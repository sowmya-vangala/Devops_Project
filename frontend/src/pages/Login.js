import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import './Login.css';

/**
 * Login page component handles user authentication.
 * Validates input fields client-side before sending credentials to the backend.
 * On success, stores the JWT token and user data via AuthContext.
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form field state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  // API error message state
  const [apiError, setApiError] = useState('');
  // Loading state for submit button
  const [loading, setLoading] = useState(false);

  /**
   * Handle input field changes and clear field-specific errors
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  /**
   * Validate form fields before submission
   * @returns {boolean} true if all fields are valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Username/email is required
    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    }

    // Password is required with minimum length
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission - validate and send login request to API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation first
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      // Send login request to the backend authentication endpoint
      const response = await axiosInstance.post('/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      // Extract token and user data from response
      const { token, user, username, email, role, id } = response.data;

      // Build user object from response (handles different response formats)
      const userData = user || { id, username: username || formData.username, email, role };

      // Store authentication data via context
      login(token, userData);

      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      // Display error message from API or a generic fallback
      if (error.response && error.response.data) {
        setApiError(error.response.data.detail || error.response.data.message || error.response.data.error || 'Invalid credentials. Please try again.');
      } else {
        setApiError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header section */}
        <div className="login-header">
          <h1>Appointment Booking</h1>
          <p>MY Appointment Booking System...</p>
          <p className="login-module">MSc Cloud DevOpsSec — National College of Ireland</p>
        </div>

        {/* Examiner Demo Access */}
        <div className="demo-credentials">
          <p className="demo-title">Examiner Access</p>
          <p className="demo-info">Username: <strong>examiner</strong></p>
          <p className="demo-info">Password: <strong>AppointBook2026</strong></p>
          <button type="button" className="demo-btn" disabled={loading} onClick={async () => {
            setLoading(true); setApiError('');
            try {
              const r = await axiosInstance.post('/auth/login', {username:'examiner',password:'AppointBook2026'});
              const {token,username,role} = r.data;
              login(token, {username, role});
              navigate('/dashboard');
            } catch(e) { setApiError('Demo login failed.'); }
            finally { setLoading(false); }
          }}>
            {loading ? 'Signing in...' : 'Login as Examiner'}
          </button>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="error-banner">
            {apiError}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username / Email field */}
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
              className={errors.username ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
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
              placeholder="Enter your password"
              className={errors.password ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Submit button with loading state */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Link to signup page */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
