import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, InputGroup, FormControl, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye } from 'react-icons/fa';
import { fetchOrders } from '../../../services/apiService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, []);
  
  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id?.toString().includes(searchTerm)) || 
      (order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.contact_number?.includes(searchTerm));
    
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
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
  
  return (
    <div className="order-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Orders</h2>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Header>
          <div className="row g-3">
            <div className="col-md-8">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search orders by ID or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="col-md-4">
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.contact_number}</td>
                    <td>${order.total_amount}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Link 
                        to={`/admin/orders/${order.id}`} 
                        className="btn btn-sm btn-info"
                      >
                        <FaEye className="me-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    {searchTerm || statusFilter ? "No orders match your search" : "No orders found"}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderList;