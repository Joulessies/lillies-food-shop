import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Dropdown,
} from "react-bootstrap";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { FaPlus, FaTags, FaBox, FaCaretDown } from "react-icons/fa";
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
  const [addingCategory, setAddingCategory] = useState(false);
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

  // Only show the category button in category section and home
  const showCategoryButton =
    location.pathname === "/admin" ||
    location.pathname === "/admin/" ||
    location.pathname.includes("/categories");

  const handleAddNewProduct = () => {
    setAddingProduct(true);
    setTimeout(() => {
      navigate("/admin/products/new", {
        state: { refresh: true },
      });
    }, 300);
  };

  const handleAddNewCategory = () => {
    setAddingCategory(true);
    setTimeout(() => {
      navigate("/admin/categories/new", {
        state: { refresh: true },
      });
    }, 300);
  };

  const handleAddPredefinedCategory = (categoryName) => {
    setAddingCategory(true);
    setTimeout(() => {
      navigate("/admin/categories/new", {
        state: {
          refresh: true,
          predefinedName: categoryName,
        },
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

              {/* Add Category Dropdown */}
              {showCategoryButton && (
                <div className="floating-action-container">
                  <Dropdown>
                    <OverlayTrigger
                      placement="left"
                      overlay={<Tooltip>Add a new category</Tooltip>}
                    >
                      <Dropdown.Toggle
                        variant="success"
                        disabled={addingCategory}
                        className="floating-action-button"
                        id="dropdown-categories"
                      >
                        {addingCategory ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FaTags />
                        )}
                        <span className="floating-button-text">
                          Add Category
                        </span>
                      </Dropdown.Toggle>
                    </OverlayTrigger>

                    <Dropdown.Menu align="end">
                      <Dropdown.Item
                        onClick={() => handleAddPredefinedCategory("Burgers")}
                      >
                        Burgers
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleAddPredefinedCategory("Sides")}
                      >
                        Sides
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleAddPredefinedCategory("Beverages")}
                      >
                        Beverages
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleAddNewCategory}>
                        Custom Category
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
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
