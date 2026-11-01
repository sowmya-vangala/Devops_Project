import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import './ServiceProviders.css';

/**
 * ServiceProviders page lists all active service providers.
 * Displays each provider's name, specialization, and contact details
 * in a responsive card grid layout.
 * Admin users see an "Add Provider" button.
 */
const ServiceProviders = () => {
  const { isAdmin } = useAuth();

  // List of providers from API
  const [providers, setProviders] = useState([]);
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch all service providers from the backend on mount
   */
  useEffect(() => {
    fetchProviders();
  }, []);

  /**
   * Fetch providers from the API endpoint
   */
  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/providers');
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];
      setProviders(data);
    } catch (err) {
      setError('Failed to load service providers. Please try again.');
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="providers-page">
      {/* Page header */}
      <div className="providers-header">
        <div>
          <h1>Service Providers</h1>
          <p className="providers-subtitle">
            Browse our qualified service providers and their specializations
          </p>
        </div>
        {/* Admin-only action to add a new provider */}
        {isAdmin() && (
          <Link to="/add-provider" className="add-provider-btn">
            + Add Provider
          </Link>
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading providers...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={fetchProviders} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Providers grid */}
      {!loading && !error && (
        <>
          {providers.length > 0 ? (
            <div className="providers-grid">
              {providers.map((provider) => (
                <div key={provider.id} className="provider-card">
                  {/* Provider avatar/initials */}
                  <div className="provider-avatar">
                    {provider.name ? provider.name.charAt(0).toUpperCase() : 'P'}
                  </div>

                  {/* Provider details */}
                  <h3 className="provider-name">{provider.name}</h3>
                  <p className="provider-specialization">{provider.specialization}</p>

                  {/* Contact information */}
                  <div className="provider-contact">
                    {provider.email && (
                      <div className="contact-item">
                        <span className="contact-label">Email:</span>
                        <span className="contact-value">{provider.email}</span>
                      </div>
                    )}
                    {provider.phone && (
                      <div className="contact-item">
                        <span className="contact-label">Phone:</span>
                        <span className="contact-value">{provider.phone}</span>
                      </div>
                    )}
                    {provider.address && (
                      <div className="contact-item">
                        <span className="contact-label">Address:</span>
                        <span className="contact-value">{provider.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Active/inactive status indicator */}
                  <div className={`provider-status ${provider.active !== false ? 'active' : 'inactive'}`}>
                    {provider.active !== false ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">&#128100;</div>
              <h3>No Service Providers Found</h3>
              <p>There are no service providers registered in the system yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceProviders;
