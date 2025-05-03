import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import CategoryList from './categories/CategoryList';
import CategoryForm from './categories/CategoryForm';
import ProductList from '../admin/products/ProductList';
import ProductForm from '../admin/products/ProductForm';
import OrderList from './orders/OrderList';
import OrderDetail from './orders/OrderDetail';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <Container fluid className="dashboard-container">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="dashboard-sidebar d-none d-md-block">
          <Sidebar />
        </Col>
        
        {/* Main Content */}
        <Col md={9} lg={10} className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/edit/:id" element={<CategoryForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;