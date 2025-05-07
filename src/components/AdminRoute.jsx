import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Add detailed debugging for admin access issues
  useEffect(() => {
    if (user) {
      console.group("Admin Access Debug Info");
      console.log("User object:", user);
      console.log("User data structure:", user?.user_data);

      // Log all admin-related properties
      const adminProps = {
        "direct.is_staff": user?.is_staff,
        "direct.is_superuser": user?.is_superuser,
        "direct.role": user?.role,
        "user_data.is_staff": user?.user_data?.is_staff,
        "user_data.is_superuser": user?.user_data?.is_superuser,
        "user_data.role": user?.user_data?.role,
        email: user?.email || user?.user_data?.email,
      };
      console.table(adminProps);
      console.groupEnd();
    }
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login page with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin - with extra debugging
  let isAdmin = false;
  let adminReason = "";

  // Enhanced admin check
  // Check for user_data in the JWT token response
  if (user.user_data) {
    if (user.user_data.is_staff === true) {
      isAdmin = true;
      adminReason = "user_data.is_staff";
    } else if (user.user_data.is_superuser === true) {
      isAdmin = true;
      adminReason = "user_data.is_superuser";
    } else if (user.user_data.role === "admin") {
      isAdmin = true;
      adminReason = "user_data.role";
    }
  }

  // Check direct user properties if not already admin
  if (!isAdmin) {
    if (user.is_staff === true) {
      isAdmin = true;
      adminReason = "direct.is_staff";
    } else if (user.is_superuser === true) {
      isAdmin = true;
      adminReason = "direct.is_superuser";
    } else if (user.role === "admin") {
      isAdmin = true;
      adminReason = "direct.role";
    }
  }

  // Special case for admin@lilliesfood.com
  if (
    !isAdmin &&
    (user.email === "admin@lilliesfood.com" ||
      user.user_data?.email === "admin@lilliesfood.com")
  ) {
    isAdmin = true;
    adminReason = "admin email match";
  }

  console.log(
    `Admin access ${isAdmin ? "GRANTED" : "DENIED"} - Reason: ${isAdmin ? adminReason : "No admin properties found"}`
  );

  // If user is not an admin, redirect to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If user is admin, render the children components
  return children;
};

export default AdminRoute;
