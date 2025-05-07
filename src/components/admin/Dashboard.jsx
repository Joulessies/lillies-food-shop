import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { FaBox } from "react-icons/fa";
import Sidebar from "./Sidebar";
import DashboardHome from "./DashboardHome";
import CategoryList from "./categories/CategoryList";
import CategoryForm from "./categories/CategoryForm";
import ProductList from "../admin/products/ProductList";
import ProductForm from "../admin/products/ProductForm";
import OrderList from "./orders/OrderList";
import OrderDetail from "./orders/OrderDetail";
// Import the User components
import UserList from "./users/UserList";
import UserListPage from "./users/UserListPage";
import UserForm from "./users/UserForm";
import "../../styles/Dashboard.css";

const Dashboard = () => {
  const [addingProduct, setAddingProduct] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the floating buttons on form pages
  const hideFloatingButton =
    location.pathname.includes("/products/new") ||
    location.pathname.includes("/products/edit/") ||
    location.pathname.includes("/categories/new") ||
    location.pathname.includes("/categories/edit/");

  // Only show the product button in product section and home
  const showProductButton =
    location.pathname === "/admin" ||
    location.pathname === "/admin/" ||
    location.pathname.includes("/products");

  const handleAddNewProduct = () => {
    setAddingProduct(true);
    setTimeout(() => {
      navigate("/admin/products/new", {
        state: { refresh: true },
      });
    }, 300);
  };

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
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/edit/:id" element={<UserForm />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>

          {/* Floating Action Buttons */}
          {!hideFloatingButton && (
            <div className="floating-buttons-container">
              {/* Add Product Button */}
              {showProductButton && (
                <div className="floating-action-container mb-2">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>Add a new product to your inventory</Tooltip>
                    }
                  >
                    <Button
                      variant="primary"
                      onClick={handleAddNewProduct}
                      disabled={addingProduct}
                      className="floating-action-button"
                    >
                      {addingProduct ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaBox />
                      )}
                      <span className="floating-button-text">
                        Add New Product
                      </span>
                    </Button>
                  </OverlayTrigger>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
