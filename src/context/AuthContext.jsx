import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    // Check if we have user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data');
      }
    }
    setLoading(false);
  }, []);

  // Modified login function to accept separate email and password
  const login = async (email, password) => {
    try {
      // Check if email/username and password are provided
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Mock user with admin privileges
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'qjcsanjose@tip.edu.ph',
        is_staff: true,
        token: 'mock-jwt-token' // Add token to the user object for apiService to use
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update state
      setUser(mockUser);
      return true;
      
      /* UNCOMMENT THIS WHEN YOUR BACKEND IS READY
      const response = await api.post('/user/login/', { email, password });
      const userData = response.data;
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      return true;
      */
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to be caught by the component
    }
  };

  // Logout function
  const logout = () => {
    // Remove user from localStorage
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
  };

  // Mock register function (until backend is ready)
  const register = async (userData) => {
    try {
      // For development, just log the registration data
      console.log('Registration data:', userData);
      return true;
      
      /* UNCOMMENT THIS WHEN YOUR BACKEND IS READY
      await api.post('/user/register/', userData);
      return true;
      */
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff === true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;