import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchOrder, updateOrderStatus } from '../../../services/apiService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Load order
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await fetchOrder(id);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [id]);
  
  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge bg="secondary">Pending</Badge>;
      case 'processing':
        return <Badge bg="warning">Processing</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!order) return <Alert variant="warning">Order not found</Alert>;
  
  return (
    <div className="order-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Order #{order.id}</h2>
        <Button variant="secondary" onClick={() => navigate('/admin/orders')}>
          <FaArrowLeft className="me-2" /> Back to Orders
        </Button>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Information</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <th width="140">Order Date:</th>
                    <td>{new Date(order.order_date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Status:</th>
                    <td>
                      <div className="d-flex align-items-center">
                        {getStatusBadge(order.status)}
                        <Form.Select 
                          className="ms-3" 
                          style={{ width: 'auto' }} 
                          value={order.status} 
                          onChange={handleStatusChange}
                          disabled={updating}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                        {updating && <Spinner size="sm" animation="border" className="ms-2" />}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>Total Amount:</th>
                    <td>${order.total_amount}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Customer Information</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <th width="140">Customer:</th>
                    <td>{order.customer_name}</td>
                  </tr>
                  <tr>
                    <th>Contact:</th>
                    <td>{order.contact_number}</td>
                  </tr>
                  <tr>
                    <th>Shipping Address:</th>
                    <td>{order.shipping_address}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </div>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">Order Items</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length > 0 ? (
                order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>${item.price}</td>
                    <td>{item.quantity}</td>
                    <td className="text-end">${item.price * item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No items found</td>
                </tr>
              )}
              <tr>
                <td colSpan="3" className="text-end fw-bold">Total:</td>
                <td className="text-end fw-bold">${order.total_amount}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderDetail;