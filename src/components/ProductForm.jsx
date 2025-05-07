import React, { useState } from "react";
import { createProduct, updateProduct } from "../api/products";

const ProductForm = ({ product = {}, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setValidationErrors({});
    setSuccessMessage("");

    try {
      // Format price as a number and stock as an integer
      const formattedProduct = {
        ...product,
        price: parseFloat(product.price),
        stock: product.stock ? parseInt(product.stock, 10) : 0,
        // Use category instead of categories for API compatibility
        category: Array.isArray(product.categories)
          ? product.categories.map((cat) =>
              typeof cat === "object" ? cat.id : cat
            )
          : [],
      };

      // Handle required fields
      const requiredFields = ["name", "description", "price"];
      const missingFields = requiredFields.filter(
        (field) => !formattedProduct[field] && formattedProduct[field] !== 0
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      let savedProduct;

      if (product.id) {
        // Update existing product
        savedProduct = await updateProduct(product.id, formattedProduct);
      } else {
        // Create new product
        savedProduct = await createProduct(formattedProduct);
      }

      setSuccessMessage("Product saved successfully!");
      onSave(savedProduct);
    } catch (error) {
      console.error("Error saving product:", error);

      // Handle validation errors from the API
      if (error.response && error.response.data) {
        const apiErrors = error.response.data;
        setValidationErrors(apiErrors);
        setErrorMessage("Please correct the highlighted fields.");
      } else {
        setErrorMessage(
          error.message || "An error occurred while saving the product."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName]
      ? Array.isArray(validationErrors[fieldName])
        ? validationErrors[fieldName][0]
        : validationErrors[fieldName]
      : null;
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for product details */}
      <div className={getFieldError("name") ? "field-error" : ""}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={product.name || ""}
          onChange={(e) => onSave({ ...product, name: e.target.value })}
        />
        {getFieldError("name") && (
          <p className="error-text">{getFieldError("name")}</p>
        )}
      </div>
      <div className={getFieldError("description") ? "field-error" : ""}>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={product.description || ""}
          onChange={(e) => onSave({ ...product, description: e.target.value })}
        />
        {getFieldError("description") && (
          <p className="error-text">{getFieldError("description")}</p>
        )}
      </div>
      <div className={getFieldError("price") ? "field-error" : ""}>
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          value={product.price || ""}
          onChange={(e) => onSave({ ...product, price: e.target.value })}
          step="0.01"
        />
        {getFieldError("price") && (
          <p className="error-text">{getFieldError("price")}</p>
        )}
      </div>
      <div className={getFieldError("stock") ? "field-error" : ""}>
        <label htmlFor="stock">Stock Quantity:</label>
        <input
          type="number"
          id="stock"
          value={product.stock || ""}
          onChange={(e) => onSave({ ...product, stock: e.target.value })}
          min="0"
          step="1"
        />
        {getFieldError("stock") && (
          <p className="error-text">{getFieldError("stock")}</p>
        )}
      </div>
      <div className={getFieldError("category") ? "field-error" : ""}>
        <label htmlFor="categories">Categories:</label>
        <input
          type="text"
          id="categories"
          value={product.categories ? product.categories.join(", ") : ""}
          onChange={(e) =>
            onSave({
              ...product,
              categories: e.target.value
                .split(",")
                .map((cat) => cat.trim())
                .filter((cat) => cat),
            })
          }
          placeholder="Enter categories separated by commas"
        />
        {getFieldError("category") && (
          <p className="error-text">{getFieldError("category")}</p>
        )}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Product"}
      </button>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </form>
  );
};

export default ProductForm;
