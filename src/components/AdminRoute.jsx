import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  

function AdminRoute({ children }) {
  const { user, loading } = useAuth();  // Using the custom hook instead of useContext
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user || !user.is_staff) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default AdminRoute;