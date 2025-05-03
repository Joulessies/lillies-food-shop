import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // Changed to import useAuth hook

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();  // Using the custom hook
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;