import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Entry point for the Cloud-Based Secure Appointment Booking System.
 * Renders the App component into the root DOM element.
 * React.StrictMode is enabled for development-time warnings.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
