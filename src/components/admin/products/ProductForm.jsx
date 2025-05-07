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
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  fetchCategories,
  createCategory,
  validateProductFields, // <-- import the validator
} from "../../../services/apiService";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: 0,
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
        const [categoriesData, productData] = await Promise.all([
          fetchCategories(),
          id ? fetchProduct(id) : Promise.resolve(null),
        ]);

        // Filter and sort categories to only show Burgers, Sides, Beverages
        const allowedCategories = ["Burgers", "Sides", "Beverages"];
        const filteredCategories = Array.isArray(categoriesData)
          ? categoriesData.filter((category) =>
              allowedCategories.includes(category.name)
            )
          : [];
        setCategories(filteredCategories);

        if (productData) {
          // Construct the full image URL if it exists
          const imageUrl = productData.image
            ? `${process.env.REACT_APP_API_URL || "http://localhost:8000"}${productData.image}`
            : null;

          setProduct({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price || "",
            stock: productData.stock || 0,
            category_id: productData.category || "",
            active: productData.is_available ?? true,
            image: productData.image || null,
          });

          if (imageUrl) {
            setImagePreview(imageUrl);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error loading form data:", err);
        setError("Failed to load form data. Please try again.");
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

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setImageError("Image size cannot exceed 5MB");
          return;
        }

        // Check file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          setImageError("Please select a valid image file (JPG, PNG, or GIF)");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should not exceed 5MB");
        e.target.value = "";
        return;
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or GIF)");
        e.target.value = "";
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Update form data
      setProduct((prev) => ({
        ...prev,
        image: file,
      }));
      setError("");
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

      // Prepare productData for validation and submission
      const productData = {
        name: product.name,
        description: product.description || "",
        price: product.price,
        category_id: product.category_id,
        active: product.active,
        stock: product.stock,
      };

      // Validate required fields using the shared utility
      const { valid, missingFields } = validateProductFields(productData);
      if (!valid) {
        setError(
          `Cannot save to database: Missing required fields: ${missingFields.join(", ")}`
        );
        setValidated(true);
        setSaving(false);
        return;
      }

      // Prepare data for backend (convert types as needed)
      const backendData = {
        name: product.name,
        description: product.description || "",
        price: parseFloat(product.price),
        stock: parseInt(product.stock || 0, 10),
        category: parseInt(product.category_id, 10), // backend expects 'category'
        active: product.active,
      };

      // Now create FormData from this object
      const formData = new FormData();
      Object.keys(backendData).forEach((key) => {
        // Skip null or undefined values
        if (backendData[key] !== null && backendData[key] !== undefined) {
          formData.append(key, backendData[key]);
        }
      });

      // Add image separately, only if it's a new file
      if (product.image instanceof File) {
        formData.append("image", product.image);
      }

      // For debugging - show exact data being submitted
      console.log(
        "Form data entries:",
        Array.from(formData.entries()).map(
          (entry) => `${entry[0]}: ${entry[1]}`
        )
      );

      // Make sure to explicitly check required fields have been set properly
      const requiredFields = ["name", "price", "category"];
      const missingRequiredFields = requiredFields.filter(
        (field) => !formData.has(field)
      );

      if (missingRequiredFields.length > 0) {
        throw new Error(
          `Missing required fields in form data: ${missingRequiredFields.join(", ")}`
        );
      }

      let result;
      if (isEditing) {
        result = await updateProduct(id, formData);
        console.log("Product successfully updated in database:", result);
      } else {
        result = await createProduct(formData);
        console.log("Product successfully added to database:", result);
      }

      // Navigate back with success state indicating database operation
      navigate("/admin/products", {
        state: {
          refresh: true,
          success: `Product "${product.name}" was successfully ${isEditing ? "updated in" : "saved to"} the database.`,
        },
      });
    } catch (err) {
      console.error("Database operation failed:", err);

      // Handle specific database errors
      if (err.response?.status === 400) {
        setError(
          `Database validation error: ${
            err.response?.data?.detail ||
            Object.values(err.response?.data || {})
              .flat()
              .join(", ") ||
            "Please check your input"
          }`
        );
      } else {
        setError(
          `Failed to ${isEditing ? "update" : "save"} product in database: ${err.message || "Please try again."}`
        );
      }
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
      {/* Admin menu/navigation */}
      <div className="mb-3">
        <nav className="admin-menu">
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              gap: "1.5rem",
            }}
          >
            <li>
              <button
                type="button"
                className="btn btn-link p-0"
                style={{
                  textDecoration: "none",
                  color: "#0d6efd",
                  fontWeight: 500,
                }}
                onClick={() => navigate("/admin/products")}
              >
                Products
              </button>
            </li>
            {/* Add more menu items here if needed */}
          </ul>
        </nav>
      </div>
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
                  <Col md={4}>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="1"
                        name="stock"
                        value={product.stock || 0}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid quantity.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={product.category_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
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
                    label="Active (available for sale)"
                    name="active"
                    checked={product.active}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: "150px", maxHeight: "150px" }}
                        className="img-thumbnail"
                        onError={(e) => {
                          console.error("Image failed to load:", imagePreview);
                          e.target.src = "/placeholder-image.jpg";
                          setError(
                            "Failed to load product image. Using placeholder instead."
                          );
                        }}
                      />
                    </div>
                  )}
                  {error && <div className="text-danger">{error}</div>}
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
