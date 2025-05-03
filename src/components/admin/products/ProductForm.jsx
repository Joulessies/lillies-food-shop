import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaUpload } from 'react-icons/fa';
// import { fetchProduct, createProduct, updateProduct, fetchCategories } from '../../../services/apiService';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  // Load categories and product if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Mock categories data
        const mockCategories = [
          { id: 1, name: 'Burgers' },
          { id: 2, name: 'Sides' },
          { id: 3, name: 'Beverages' },
          { id: 4, name: 'Desserts' },
        ];
        
        setCategories(mockCategories);
        
        if (isEditing) {
          // Load product data if editing
          const mockProduct = {
            id: parseInt(id),
            name: id === '101' ? 'Classic Burger' : 'Test Product',
            description: 'Product description goes here',
            price: 120.00,
            category_id: 1,
            active: true,
            image: '/assets/images/Burgers/classic.avif'
          };
          
          setProduct(mockProduct);
          setImagePreview(mockProduct.image);
        } else {
          // Set default category if not editing
          if (mockCategories.length > 0) {
            setProduct(prev => ({ ...prev, category_id: mockCategories[0].id }));
          }
        }
        
        /* UNCOMMENT WHEN YOUR BACKEND IS READY
        const categoriesResponse = await fetchCategories();
        setCategories(categoriesResponse);
        
        if (isEditing) {
          const productResponse = await fetchProduct(id);
          setProduct(productResponse);
          setImagePreview(productResponse.image);
        } else if (categoriesResponse.length > 0) {
          setProduct(prev => ({ ...prev, category_id: categoriesResponse[0].id }));
        }
        */
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditing]);
  
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setProduct(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files[0];
      setProduct(prev => ({ ...prev, [name]: file }));
      
      // Create a preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (name === 'price') {
      // Ensure price is a valid number
      const priceValue = value.replace(/[^0-9.]/g, '');
      setProduct(prev => ({ ...prev, [name]: priceValue }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Convert price to number
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price),
      category_id: parseInt(product.category_id)
    };
    
    try {
      setSaving(true);
      
      /* UNCOMMENT WHEN YOUR BACKEND IS READY
      if (isEditing) {
        await updateProduct(id, formattedProduct);
      } else {
        await createProduct(formattedProduct);
      }
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to products list
      navigate('/admin/products');
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} product`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  
  return (
    <div className="product-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
        <Button variant="secondary" onClick={() => navigate('/admin/products')}>
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
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
                    name="description"
                    rows={3}
                    value={product.description || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₱)</Form.Label>
                      <Form.Control
                        type="text"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
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
                        {categories.map(category => (
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
                    id="product-active"
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
                  <div className="text-center mb-3">
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="img-thumbnail product-image-preview"
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        No image selected
                      </div>
                    )}
                  </div>
                  <div className="d-grid">
                    <Button
                      variant="outline-secondary"
                      as="label"
                      htmlFor="product-image-upload"
                      className="d-flex align-items-center justify-content-center"
                    >
                      <FaUpload className="me-2" /> Upload Image
                    </Button>
                    <Form.Control
                      type="file"
                      id="product-image-upload"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="mt-3">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={saving}
                className="d-flex align-items-center"
              >
                {saving && <Spinner animation="border" size="sm" className="me-2" />}
                <FaSave className="me-2" /> {isEditing ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductForm;