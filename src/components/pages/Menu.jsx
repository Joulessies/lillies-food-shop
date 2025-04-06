import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Modal,
  Button,
  Form,
} from 'react-bootstrap';
import '../../styles/Menu.css';
import { useCart } from '../../context/CartContext';

const Menu = () => {
  // State for modal
  const [show, setShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  const handleShow = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setShow(true);
  };

  // Handle modal close
  const handleClose = () => {
    setShow(false);
    setSelectedItem(null);
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    addToCart(selectedItem, quantity);
    handleClose();
  };

  // Sample menu data
  const menuItems = [
    {
      id: 1,
      category: 'Burgers',
      items: [
        {
          id: 101,
          name: 'Classic Burger',
          description:
            'Beef patty, lettuce, tomato, onion, and special sauce on a potato bun',
          price: 8.99,
          image: 'https://via.placeholder.com/300x200',
        },
        {
          id: 102,
          name: 'Cheese Burger',
          description:
            'Beef patty, cheddar cheese, lettuce, tomato, onion, and special sauce',
          price: 9.99,
          image: 'https://via.placeholder.com/300x200',
        },
        {
          id: 103,
          name: 'Bacon Burger',
          description:
            'Beef patty, bacon, lettuce, tomato, onion, and special sauce',
          price: 10.99,
          image: 'https://via.placeholder.com/300x200',
        },
      ],
    },
    {
      id: 2,
      category: 'Sides',
      items: [
        {
          id: 201,
          name: 'French Fries',
          description:
            'Crispy golden french fries with our signature seasoning',
          price: 3.99,
          image: 'https://via.placeholder.com/300x200',
        },
        {
          id: 202,
          name: 'Onion Rings',
          description: 'Crispy battered onion rings served with dipping sauce',
          price: 4.99,
          image: 'https://via.placeholder.com/300x200',
        },
        {
          id: 203,
          name: 'Coleslaw',
          description: 'Fresh cabbage, carrots, and our special dressing',
          price: 2.99,
          image: 'https://via.placeholder.com/300x200',
        },
      ],
    },
    {
      id: 3,
      category: 'Beverages',
      items: [
        {
          id: 301,
          name: 'Soft Drinks',
          description: 'Choose from a variety of refreshing beverages',
          price: 1.99,
          image: 'https://via.placeholder.com/300x200',
        },
        {
          id: 302,
          name: 'Milkshakes',
          description: 'Creamy handcrafted milkshakes in various flavors',
          price: 4.99,
          image: 'https://via.placeholder.com/300x200',
        },
        {
          id: 303,
          name: 'Iced Tea',
          description: 'Freshly brewed iced tea, sweetened or unsweetened',
          price: 2.49,
          image: 'https://via.placeholder.com/300x200',
        },
      ],
    },
  ];

  return (
    <Container className="menu-page py-5">
      <h1 className="text-center mb-5">Our Menu</h1>

      {menuItems.map((category) => (
        <div key={category.id} className="menu-category mb-5">
          <h2 className="category-title mb-4">{category.category}</h2>
          <Row>
            {category.items.map((item) => (
              <Col md={4} sm={6} className="mb-4" key={item.id}>
                <Card
                  className="menu-item-card h-100"
                  onClick={() => handleShow(item)}
                >
                  <Card.Img variant="top" src={item.image} alt={item.name} />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title>{item.name}</Card.Title>
                      <span className="menu-price">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      {/* Item Detail Modal */}
      <Modal show={show} onHide={handleClose} centered size="lg">
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="img-fluid modal-item-image"
                  />
                </Col>
                <Col md={6}>
                  <h3 className="modal-item-price">
                    ${selectedItem.price.toFixed(2)}
                  </h3>
                  <p className="modal-item-description">
                    {selectedItem.description}
                  </p>

                  <Form className="mt-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <div className="quantity-selector">
                        <Button
                          variant="outline-secondary"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="quantity-value">{quantity}</span>
                        <Button
                          variant="outline-secondary"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </Form.Group>

                    <div className="mt-4">
                      <h4 className="total-price">
                        Total: ${(selectedItem.price * quantity).toFixed(2)}
                      </h4>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Menu;
