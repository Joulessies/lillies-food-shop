import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Image,
  Badge,
  Spinner,
  Alert,
  Modal,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaPlus, FaSearch } from "react-icons/fa";
import { fetchProducts, deleteProduct } from "../../../services/apiService";
import "../../../styles/AdminTables.css";
import { toast } from "react-toastify";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);
  const [imageError, setImageError] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  // Refresh products list when navigating back from product creation
  useEffect(() => {
    const handleNavigation = () => {
      const location = window.location;
      if (location.state?.refresh) {
        loadProducts();
        // Clear the state to prevent unnecessary refreshes
        window.history.replaceState({}, document.title);
      }
    };

    handleNavigation();

    // Add event listener for popstate to handle back navigation
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error("Invalid products data format");
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.message || "Failed to load products. Please try again.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setAddingProduct(true);
    setTimeout(() => {
      navigate("/admin/products/new", {
        state: { refresh: true },
      });
    }, 300); // Small delay for the loading state to be visible
  };

  const handleEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteProduct(productToDelete.id);

      // Remove the deleted product from the state
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);

      // Show success message
      setSuccessMessage(`Product "${productToDelete.name}" has been deleted.`);
      toast.success("Product deleted successfully");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(`Failed to delete product: ${err.message}`);
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleImageError = (productId) => {
    console.log(`Image failed to load for product ${productId}`);
    setImageError((prev) => ({ ...prev, [productId]: true }));
  };

  const handleImageLoad = (productId) => {
    console.log(`Image loaded successfully for product ${productId}`);
    setImageLoading((prev) => ({ ...prev, [productId]: false }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.REACT_APP_API_URL || "http://localhost:8000"}${imagePath}`;
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()) ||
      product.description
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()) ||
      (product.category &&
        product.category.name
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()))
  );

  // Helper function to determine stock status color
  const getStockStatusColor = (stock) => {
    if (stock === undefined || stock === null) return "secondary";
    if (stock <= 0) return "danger";
    if (stock < 10) return "warning";
    return "success";
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="mb-0 me-2">Products</h2>
        <Link
          to="/admin/products/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Product
        </Link>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          className="mt-3"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          className="mt-3"
          dismissible
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="mb-4 search-container">
        <div className="input-group">
          <div className="input-group-text bg-light">
            <FaSearch />
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="table-responsive">
        <Table hover className="admin-table product-table align-middle">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>#</th>
              <th style={{ width: "80px" }}>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <div
                      className="w-16 h-16 flex-shrink-0"
                      style={{ width: "60px", height: "60px" }}
                    >
                      {product.image && !imageError[product.id] ? (
                        <>
                          {imageLoading[product.id] !== false && (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                              <Spinner animation="border" size="sm" />
                            </div>
                          )}
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            onError={() => handleImageError(product.id)}
                            onLoad={() => handleImageLoad(product.id)}
                            style={{
                              display:
                                imageLoading[product.id] !== false
                                  ? "none"
                                  : "block",
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                          />
                        </>
                      ) : (
                        <div
                          className="w-full h-full bg-gray-100 rounded flex items-center justify-center"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <span className="text-gray-400 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category_name || "-"}</td>
                  <td>₱{parseFloat(product.price).toFixed(2)}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {product.stock <= 0
                            ? "Out of stock"
                            : product.stock < 10
                              ? "Low stock"
                              : "In stock"}
                        </Tooltip>
                      }
                    >
                      <Badge bg={getStockStatusColor(product.stock)}>
                        {product.stock !== undefined && product.stock !== null
                          ? product.stock
                          : "N/A"}
                      </Badge>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <Badge bg={product.active ? "success" : "secondary"}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(product.id)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDelete(product)}
                        title="Delete"
                      >
                        <FaTrashAlt />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  {searchQuery
                    ? "No products match your search."
                    : "No products found."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <Container>
              <Row>
                <Col xs={12}>
                  <p>Are you sure you want to delete the following product?</p>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col xs={3}>
                  {productToDelete.image && (
                    <Image
                      src={productToDelete.image}
                      alt={productToDelete.name}
                      width={50}
                      height={50}
                      className="product-thumbnail"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </Col>
                <Col xs={9}>
                  <h5>{productToDelete.name}</h5>
                  <p className="text-muted mb-0">
                    {productToDelete.category
                      ? productToDelete.category.name
                      : ""}
                    {" • "}₱{parseFloat(productToDelete.price).toFixed(2)}
                  </p>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col xs={12}>
                  <div className="alert alert-warning">
                    <strong>Warning:</strong> This action cannot be undone.
                  </div>
                </Col>
              </Row>
            </Container>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductList;
