import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
// import { fetchCategories, deleteCategory } from '../../services/apiService';
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      // Mock data instead of API call
      const mockCategories = [
        {
          id: 1,
          name: "Burgers",
          description: "Delicious hamburgers and cheeseburgers",
          active: true,
        },
        {
          id: 2,
          name: "Sides",
          description: "French fries, onion rings and more",
          active: true,
        },
        {
          id: 3,
          name: "Beverages",
          description: "Soft drinks, shakes, and coffee",
          active: true,
        },
        {
          id: 4,
          name: "Desserts",
          description: "Sweet treats to finish your meal",
          active: true,
        },
        {
          id: 5,
          name: "Combos",
          description: "Value meals with burger, sides and drink",
          active: true,
        },
        {
          id: 6,
          name: "Kids Meals",
          description: "Smaller portions with a toy",
          active: false,
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setCategories(mockCategories);
        setLoading(false);
      }, 500);

      /* UNCOMMENT WHEN YOUR BACKEND IS READY
      const response = await fetchCategories();
      setCategories(response);
      */
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
      // Mock deletion
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryToDelete.id)
      );

      /* UNCOMMENT WHEN YOUR BACKEND IS READY
      await deleteCategory(categoryToDelete.id);
      */

      handleCloseDeleteModal();
      // Show success message
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
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  <span
                    className={`badge ${category.active ? "bg-success" : "bg-secondary"}`}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
