import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute component guards protected routes.
 * If the user is not authenticated, they are redirected to the login page.
 * Shows a loading spinner while authentication state is being determined.
 */
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect unauthenticated users to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected content for authenticated users
  return children;
};

export default PrivateRoute;
