import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
} from "../services/apiService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    // Check if we have user data in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data");
      }
    }
    setLoading(false);
  }, []);

  // Login function that uses the real authentication
  const login = async (email, password) => {
    try {
      // Check if email/username and password are provided
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Use the real login function from apiService
      const userData = await apiLogin(email, password);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to be caught by the component
    }
  };

  // Logout function
  const logout = () => {
    // Remove user from localStorage
    localStorage.removeItem("user");

    // Update state
    setUser(null);
  };

  // Register function using the API
  const register = async (userData) => {
    try {
      const result = await apiRegister(userData);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
