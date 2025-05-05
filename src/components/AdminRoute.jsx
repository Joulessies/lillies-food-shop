import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading } = useAuth(); // Using the custom hook instead of useContext

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!user.is_staff) {
    // User is authenticated but not an admin, redirect to home page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin privileges
  return children;
}

export default AdminRoute;
