import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Image,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  fetchCategories,
  createCategory,
} from "../../../services/apiService";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    active: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Load categories and product if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load categories first
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        // Check if we need to ensure default categories exist
        const defaultCategories = ["Burgers", "Sides", "Beverages"];
        const existingCategoryNames = categoriesData.map((c) => c.name);

        const missingCategories = defaultCategories.filter(
          (name) => !existingCategoryNames.includes(name)
        );

        // Create missing default categories
        if (missingCategories.length > 0) {
          setCreatingCategory(true);

          const newCategoryPromises = missingCategories.map((name) =>
            createCategory({
              name,
              description: `${name} category`,
              active: true,
            })
          );

          const newCategories = await Promise.all(newCategoryPromises);

          // Refresh categories list
          const updatedCategories = await fetchCategories();
          setCategories(updatedCategories);
          setCreatingCategory(false);
        }

        // If editing, load product data
        if (isEditing) {
          const productData = await fetchProduct(id);
          setProduct(productData);

          if (productData.image) {
            setImagePreview(productData.image);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error loading form data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      if (files && files[0]) {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          setImageError("Image size cannot exceed 5MB");
          return;
        }

        if (!file.type.match("image.*")) {
          setImageError("Please select a valid image file");
          return;
        }

        setImageError(null);
        setProduct((prev) => ({ ...prev, image: file }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const newValue = type === "checkbox" ? checked : value;
      setProduct((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (imageError) {
      return;
    }

    try {
      setSaving(true);

      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(product).forEach((key) => {
        if (product[key] !== null && product[key] !== undefined) {
          formData.append(key, product[key]);
        }
      });

      if (isEditing) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }

      navigate("/admin/products", { state: { refresh: true } });
    } catch (err) {
      console.error("Error saving product:", err);
      setError(
        `Failed to ${isEditing ? "update" : "create"} product. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || creatingCategory) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-3">
          {creatingCategory ? "Setting up default categories..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="product-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
        <Button variant="secondary" onClick={() => navigate("/admin/products")}>
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a product name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={product.description || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₱)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid price.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={product.category_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories
                          .sort((a, b) => {
                            // Sort to prioritize burger, sides, beverages first
                            const defaultOrder = [
                              "Burgers",
                              "Sides",
                              "Beverages",
                            ];
                            const aIndex = defaultOrder.indexOf(a.name);
                            const bIndex = defaultOrder.indexOf(b.name);

                            if (aIndex !== -1 && bIndex !== -1)
                              return aIndex - bIndex;
                            if (aIndex !== -1) return -1;
                            if (bIndex !== -1) return 1;
                            return a.name.localeCompare(b.name);
                          })
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Please select a category.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    name="active"
                    checked={product.active}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {imageError && (
                    <div className="text-danger mt-2">{imageError}</div>
                  )}
                  <div className="text-muted mt-1">
                    <small>Max size: 5MB. Format: JPG, PNG, GIF.</small>
                  </div>

                  {imagePreview && (
                    <div className="mt-3 text-center">
                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        thumbnail
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 d-flex justify-content-end">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="d-flex align-items-center"
              >
                {saving && (
                  <Spinner animation="border" size="sm" className="me-2" />
                )}
                <FaSave className="me-2" /> {isEditing ? "Update" : "Save"}{" "}
                Product
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductForm;
