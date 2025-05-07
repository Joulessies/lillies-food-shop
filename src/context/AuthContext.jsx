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
      const response = await apiLogin(email, password);

      // Ensure admin role is properly set
      if (email === "admin@example.com") {
        // Force admin properties for known admin user
        response.role = "admin";
        response.is_superuser = true;
        response.is_staff = true;
      }

      console.log("Raw API response:", response);

      // Check if we have JWT tokens in the response
      const hasJwtTokens = response.access && response.refresh;
      console.log("Has JWT tokens:", hasJwtTokens);

      // Process the response data to ensure it has the expected structure
      const userData = {
        ...response,
        // IMPORTANT: Preserve access and refresh tokens for JWT authentication
        access: response.access || response.token || response.access_token,
        refresh: response.refresh || response.refresh_token,
        // Make sure to preserve admin-related properties
        is_staff: response.is_staff || response.user?.is_staff || false,
        is_superuser:
          response.is_superuser || response.user?.is_superuser || false,
        role: response.role || response.user?.role || "customer",
        // Extract user details if they exist in the response
        first_name: response.first_name || response.user?.first_name || "",
        last_name: response.last_name || response.user?.last_name || "",
        name:
          response.name ||
          response.user?.name ||
          (response.first_name || response.user?.first_name
            ? `${response.first_name || response.user?.first_name} ${response.last_name || response.user?.last_name || ""}`.trim()
            : null),
        // Also store the data in the expected format for the Navbar component
        user_data: {
          first_name: response.first_name || response.user?.first_name || "",
          last_name: response.last_name || response.user?.last_name || "",
          name:
            response.name ||
            response.user?.name ||
            (response.first_name || response.user?.first_name
              ? `${response.first_name || response.user?.first_name} ${response.last_name || response.user?.last_name || ""}`.trim()
              : null),
          email: response.email || response.user?.email || email,
          // Make sure to include admin properties in user_data too
          is_staff: response.is_staff || response.user?.is_staff || false,
          is_superuser:
            response.is_superuser || response.user?.is_superuser || false,
          role: response.role || response.user?.role || "customer",
        },
      };

      console.log("Processed user data:", {
        ...userData,
        access: userData.access
          ? `${userData.access.substring(0, 15)}...`
          : null,
        refresh: userData.refresh
          ? `${userData.refresh.substring(0, 15)}...`
          : null,
      });

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);
      return userData;
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

  // Helper function to determine if user has admin privileges
  const isUserAdmin = () => {
    if (!user) return false;

    // Check JWT token response format (user may contain user_data)
    if (user.user_data) {
      return (
        user.user_data.is_staff === true ||
        user.user_data.is_superuser === true ||
        user.user_data.role === "admin"
      );
    }

    // Check direct user properties
    return (
      user.is_staff === true ||
      user.is_superuser === true ||
      user.role === "admin"
    );
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: isUserAdmin(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
