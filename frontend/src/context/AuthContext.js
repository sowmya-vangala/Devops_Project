import React, { createContext, useState, useEffect, useContext } from 'react';

// Create authentication context for global state management
const AuthContext = createContext(null);

/**
 * AuthProvider component wraps the application and provides
 * authentication state (user, token) and actions (login, logout)
 * to all child components via React Context API.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check localStorage for persisted session data
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // If stored user data is corrupted, clear it
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login function - stores token and user info in both state and localStorage
   * @param {string} newToken - JWT token from the backend
   * @param {object} newUser - User object containing id, username, email, role
   */
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  /**
   * Logout function - clears all authentication data and redirects to login
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Check if the current user has admin role
   * @returns {boolean} true if user has ADMIN or ROLE_ADMIN role
   */
  const isAdmin = () => {
    return user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the auth context from any component.
 * Throws an error if used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
