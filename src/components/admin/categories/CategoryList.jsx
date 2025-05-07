import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { fetchCategories } from "../../../services/apiService";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchCategories();
      setCategories(response);
      setLoading(false);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories. Please try again later.");
      setLoading(false);
    }
  };

  const handleShowDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryToDelete.id)
      );
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again later.");
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {categories.length === 0 ? (
        <p className="text-center">No categories found.</p>
      ) : (
        <div>
          {categories
            .filter((category) =>
              ["Burgers", "Sides", "Beverages"].includes(category.name)
            )
            .map((category) => (
              <Card key={category.id} className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h4 className="mb-0">{category.name}</h4>
                      <div className="text-muted">{category.description}</div>
                      <span
                        className={`badge ${category.active ? "bg-success" : "bg-secondary"}`}
                      >
                        {category.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="btn-group">
                      <Link
                        to={`/admin/categories/edit/${category.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleShowDeleteModal(category)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </div>
                  </div>
                  <div>
                    <strong>Products:</strong>
                    {category.products && category.products.length > 0 ? (
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Price</th>
                              <th>Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.products.map((product) => (
                              <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>₱{product.price}</td>
                                <td>{product.category_name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-2">
                          <Link
                            to={`/admin/products/new?category=${category.id}`}
                            className="btn btn-sm btn-success"
                          >
                            + Add Product to {category.name}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted mt-2">
                        No products in this category.
                        <br />
                        <Link
                          to={`/admin/products/new?category=${category.id}`}
                          className="btn btn-sm btn-success mt-2"
                        >
                          + Add Product to {category.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
        </div>
      )}

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete ${categoryToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default CategoryList;
