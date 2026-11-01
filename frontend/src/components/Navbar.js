import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * Navbar component provides navigation links and user session controls.
 * Displays different links based on authentication status and user role.
 * Shows the logged-in username and a logout button.
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle user logout - clears auth state and redirects to login
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Helper to determine if a nav link is currently active
   * @param {string} path - The route path to check
   * @returns {string} CSS class name for active state
   */
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">&#128197;</span>
          AppointmentHub
        </Link>

        {/* Navigation links - only visible when logged in */}
        {user && (
          <div className="navbar-links">
            <Link to="/dashboard" className={isActive('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/book-appointment" className={isActive('/book-appointment')}>
              Book Appointment
            </Link>
            <Link to="/providers" className={isActive('/providers')}>
              Providers
            </Link>
            {/* Admin-only link to add new service providers */}
            {isAdmin() && (
              <Link to="/add-provider" className={isActive('/add-provider')}>
                Add Provider
              </Link>
            )}
          </div>
        )}

        {/* User info and logout button */}
        {user && (
          <div className="navbar-user">
            <span className="user-greeting">
              Welcome, <strong>{user.username}</strong>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
