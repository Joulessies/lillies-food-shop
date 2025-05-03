import React, { useState, useEffect } from 'react';
import { Table, Button, Image, Badge, Spinner, Alert, Modal, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaSearch } from 'react-icons/fa';
import { fetchProducts, deleteProduct } from '../../../services/apiService';
import '../../../styles/AdminTables.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    navigate('/admin/products/new');
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
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
      
      // Show success message
      setSuccessMessage(`Product "${productToDelete.name}" has been deleted.`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(`Failed to delete product: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Products</h2>
        <Button variant="primary" onClick={handleAddNew}>
          <FaPlus className="me-2" /> Add New Product
        </Button>
      </div>
      
      {successMessage && (
        <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
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
              <th style={{ width: '80px' }}>#</th>
              <th style={{ width: '100px' }}>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        width={60} 
                        height={60} 
                        className="product-thumbnail"
                      />
                    ) : (
                      <div className="no-image-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category ? product.category.name : '-'}</td>
                  <td>₱{parseFloat(product.price).toFixed(2)}</td>
                  <td>
                    <Badge bg={product.active ? 'success' : 'secondary'}>
                      {product.active ? 'Active' : 'Inactive'}
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
                <td colSpan={7} className="text-center py-4">
                  {searchQuery ? 'No products match your search.' : 'No products found.'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
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
                      width={60} 
                      height={60} 
                      className="product-thumbnail"
                    />
                  )}
                </Col>
                <Col xs={9}>
                  <h5>{productToDelete.name}</h5>
                  <p className="text-muted mb-0">
                    {productToDelete.category ? productToDelete.category.name : ''}
                    {' • '}₱{parseFloat(productToDelete.price).toFixed(2)}
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