import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaBox, FaList, FaShoppingCart, FaSync, FaPlus } from "react-icons/fa";
import { fetchDashboardStats } from "../../services/apiService";
import SalesChart from "./charts/SalesChart";
import "../../styles/Dashboard.css";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    recentOrders: [],
    lowStockProducts: [],
    categorySales: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch data from API service
      const data = await fetchDashboardStats();

      setStats({
        totalProducts: data.total_products || data.totalProducts || 0,
        totalCategories: data.total_categories || data.totalCategories || 0,
        totalOrders: data.total_orders || data.totalOrders || 0,
        recentOrders: data.recent_orders || data.recentOrders || [],
        lowStockProducts:
          data.low_stock_products || data.lowStockProducts || [],
        categorySales: data.category_sales || data.categorySales || [],
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false); // Don't show loading spinner for automatic updates
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  // Add new product handler
  const handleAddNewProduct = () => {
    setAddingProduct(true);
    setTimeout(() => {
      navigate("/admin/products/new", {
        state: { refresh: true },
      });
    }, 300);
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <Spinner animation="border" role="status" size="lg" />
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-3">
        <h4>Error Loading Dashboard</h4>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => fetchDashboardData()}>
          <FaSync className="me-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="dashboard-title mb-0">Dashboard Overview</h2>
        <div>
          {lastUpdated && (
            <div className="text-muted mt-1 small">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <Row className="stats-cards mb-4">
        <Col md={4}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stats-title">Total Products</h6>
                  <h2 className="stats-value">{stats.totalProducts}</h2>
                </div>
                <div className="stats-icon">
                  <FaBox />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stats-title">Categories</h6>
                  <h2 className="stats-value">{stats.totalCategories}</h2>
                </div>
                <div className="stats-icon">
                  <FaList />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stats-title">Total Orders</h6>
                  <h2 className="stats-value">{stats.totalOrders}</h2>
                </div>
                <div className="stats-icon">
                  <FaShoppingCart />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/admin/orders" className="btn btn-sm btn-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/admin/orders/${order.id}`}>
                            #{order.id}
                          </Link>
                        </td>
                        <td>{order.customer_name}</td>
                        <td>
                          <Badge
                            bg={
                              order.status === "delivered"
                                ? "success"
                                : order.status === "processing"
                                  ? "warning"
                                  : order.status === "shipped"
                                    ? "primary"
                                    : order.status === "cancelled"
                                      ? "danger"
                                      : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td>
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td>₱{parseFloat(order.total_amount).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Low Stock Products</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.length > 0 ? (
                    stats.lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <Link to={`/admin/products/edit/${product.id}`}>
                            {product.name}
                          </Link>
                        </td>
                        <td>
                          <Badge bg={product.stock < 5 ? "danger" : "warning"}>
                            {product.stock}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">
                        No low stock products
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Sales by Category</h5>
            </Card.Header>
            <Card.Body>
              <SalesChart data={stats.categorySales} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Floating Action Button for adding new product */}
      <div className="floating-action-container">
        <OverlayTrigger
          placement="left"
          overlay={<Tooltip>Add a new product to your inventory</Tooltip>}
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
              <FaPlus />
            )}
            <span className="floating-button-text">Add New Product</span>
          </Button>
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default DashboardHome;
