import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaList, FaBox, FaShoppingCart, FaSignOutAlt, FaStore } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Sidebar.css'; 

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path) => {
    return location.pathname.includes(`/admin${path}`);
  };
  
  return (
    <div className="sidebar-sticky">
      <div className="sidebar-header">
        <h3>Lillies Admin</h3>
      </div>
      
      <Nav className="flex-column">
        <Nav.Link 
          as={Link} 
          to="/admin" 
          className={location.pathname === '/admin' ? 'active' : ''}
        >
          <FaTachometerAlt className="me-2" /> Dashboard
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/categories" 
          className={isActive('/categories') ? 'active' : ''}
        >
          <FaList className="me-2" /> Categories
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/products" 
          className={isActive('/products') ? 'active' : ''}
        >
          <FaBox className="me-2" /> Products
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/orders" 
          className={isActive('/orders') ? 'active' : ''}
        >
          <FaShoppingCart className="me-2" /> Orders
        </Nav.Link>
      </Nav>
      
      <div className="sidebar-footer">
        <Nav.Link as={Link} to="/" className="back-to-site">
          <FaStore className="me-2" /> Back to Site
        </Nav.Link>
        
        <Nav.Link onClick={logout} className="logout-link">
          <FaSignOutAlt className="me-2" /> Logout
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;