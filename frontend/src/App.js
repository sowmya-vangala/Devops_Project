import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import EditAppointment from './pages/EditAppointment';
import AppointmentDetail from './pages/AppointmentDetail';
import ServiceProviders from './pages/ServiceProviders';
import AddProvider from './pages/AddProvider';
import './App.css';

/**
 * App component is the root of the application.
 * Sets up routing with react-router-dom and wraps everything
 * in the AuthProvider for global authentication state.
 *
 * Routes:
 * - /login, /signup: Public routes for authentication
 * - /dashboard: Protected, shows user's appointments
 * - /book-appointment: Protected, create new appointment
 * - /edit-appointment/:id: Protected, edit existing appointment
 * - /appointments/:id: Protected, view appointment details
 * - /providers: Protected, list all service providers
 * - /add-provider: Protected, admin-only provider creation
 * - /: Redirects to dashboard
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Router>
        {/* Navbar is rendered on all pages; it conditionally shows links */}
        <Navbar />

        {/* Application routes */}
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes - require valid JWT token */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <PrivateRoute>
                <BookAppointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-appointment/:id"
            element={
              <PrivateRoute>
                <EditAppointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments/:id"
            element={
              <PrivateRoute>
                <AppointmentDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/providers"
            element={
              <PrivateRoute>
                <ServiceProviders />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-provider"
            element={
              <PrivateRoute>
                <AddProvider />
              </PrivateRoute>
            }
          />

          {/* Default route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all route for 404 - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
