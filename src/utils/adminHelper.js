/**
 * Utility function to check if the current user has admin access
 */
export const checkAdminAccess = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    // Grant admin access to known admin email regardless of other flags
    if (userData.email === "admin@example.com") {
      return true;
    }

    // Otherwise check normal flags
    return userData.role === "admin" || userData.is_superuser === true;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};

/**
 * Force admin access by updating user data in localStorage
 * Only use for development/testing!
 */
export const forceAdminAccess = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    userData.role = "admin";
    userData.is_superuser = true;
    userData.is_staff = true;
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error forcing admin access:", error);
    return false;
  }
};
