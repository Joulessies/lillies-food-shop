import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { fetchCategory, createCategory, updateCategory } from '../../../services/apiService';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [category, setCategory] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  // Load category if editing
  useEffect(() => {
    if (isEditing) {
      const loadCategory = async () => {
        try {
          setLoading(true);
          const data = await fetchCategory(id);
          setCategory(data);
          setError(null);
        } catch (err) {
          setError('Failed to load category');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      loadCategory();
    }
  }, [id, isEditing]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditing) {
        await updateCategory(id, category);
      } else {
        await createCategory(category);
      }
      
      navigate('/admin/categories');
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} category`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  
  return (
    <div className="category-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
        <Button variant="secondary" onClick={() => navigate('/admin/categories')}>
          <FaArrowLeft className="me-2" /> Back to Categories
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a category name.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={category.description || ''}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Button 
              type="submit" 
              variant="primary" 
              disabled={saving}
              className="d-flex align-items-center"
            >
              {saving && <Spinner animation="border" size="sm" className="me-2" />}
              <FaSave className="me-2" /> {isEditing ? 'Update' : 'Create'} Category
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CategoryForm;