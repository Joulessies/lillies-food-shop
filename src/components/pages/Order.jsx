import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { sendOrderConfirmation } from "../../services/emailService";
import "../../styles/Order.css";

const Order = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [validated, setValidated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [orderStatus, setOrderStatus] = useState(null);

  // Form fields state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentNumber: "",
    accountName: "",
    name: "",
    deliveryMethod: "pickup",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    // Form validation
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setOrderStatus({
        type: "danger",
        message: "Please fill in all required fields correctly",
      });
      return;
    }

    // Additional email validation
    if (!formData.email || !formData.email.includes("@")) {
      setOrderStatus({
        type: "danger",
        message: "Please enter a valid email address",
      });
      return;
    }

    // Prepare order data
    const orderDetails = {
      items: cartItems,
      total: getTotalPrice(),
      customerInfo: {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      },
    };

    // Log the email being used (for debugging)
    console.log("Submitting order with email:", formData.email);

    try {
      // Process the order first
      processOrder();

      // Try to send email confirmation with clean email address
      try {
        const cleanEmail = formData.email.trim().toLowerCase();
        console.log("Attempting to send email to:", cleanEmail);

        // Call email service with proper parameters
        const result = await sendOrderConfirmation(orderDetails, cleanEmail);

        if (result.success) {
          setOrderStatus({
            type: "success",
            message:
              "Order placed successfully! Check your email for confirmation.",
          });
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Still show a success message for the order but warn about email
        setOrderStatus({
          type: "warning",
          message: `Order placed successfully! (Email confirmation failed: ${emailError.message})`,
        });
      }

      // Clear form data
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        paymentNumber: "",
        accountName: "",
        name: "",
        deliveryMethod: "pickup",
      });
    } catch (error) {
      console.error("Order processing error:", error);
      setOrderStatus({
        type: "danger",
        message:
          "An error occurred while processing your order. Please try again.",
      });
    }
  };

  const processOrder = () => {
    // Generate random order number
    const randomOrderNumber =
      "ORD-" + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNumber);
    setOrderPlaced(true);

    // Clear cart after successful order
    clearCart();

    // In a real app, here you would send the order to a backend
    console.log("Order processed:", {
      orderNumber: randomOrderNumber,
      items: cartItems,
      customerInfo: formData,
      totalAmount: getTotalPrice(),
      paymentMethod: paymentMethod,
    });
  };

  const handleContinueShopping = () => {
    navigate("/menu");
  };

  // If cart is empty and no order placed, redirect to menu
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          Your cart is empty. Add some items before checkout.
        </Alert>
        <Button
          variant="primary"
          onClick={handleContinueShopping}
          className="mt-3"
        >
          Browse Menu
        </Button>
      </Container>
    );
  }

  // Order confirmation view
  if (orderPlaced) {
    return (
      <Container className="py-5 order-confirmation">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body className="text-center p-5">
                <div className="confirmation-icon mb-4">
                  <i className="bi bi-check-circle-fill text-success"></i>
                </div>
                <h2 className="mb-4">Order Confirmed!</h2>
                <p className="mb-3">Thank you for your order.</p>
                <p className="order-number mb-4">
                  Order Number: <strong>{orderNumber}</strong>
                </p>
                <p>We've sent a confirmation email with your order details.</p>
                <p className="mb-4">
                  Your food will be prepared and delivered soon!
                </p>
                <Button
                  variant="primary"
                  onClick={handleContinueShopping}
                  className="mt-3"
                >
                  Continue Shopping
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Checkout form view
  return (
    <Container className="py-5 checkout-page">
      <h1 className="text-center mb-4">Checkout</h1>

      {orderStatus && (
        <Alert variant={orderStatus.type}>{orderStatus.message}</Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="mb-3">Delivery Information</h3>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your first name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your last name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid email.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your phone number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Delivery Method</Form.Label>
                  <Form.Select
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </Form.Select>
                </Form.Group>

                {formData.deliveryMethod === "delivery" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Delivery Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your city.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your ZIP code.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <h3 className="mt-4 mb-3">Payment Method</h3>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    label="GCash"
                    name="paymentMethod"
                    value="gcash"
                    checked={paymentMethod === "gcash"}
                    onChange={() => setPaymentMethod("gcash")}
                    id="gcash-payment"
                  />
                  <Form.Check
                    type="radio"
                    label="Maya"
                    name="paymentMethod"
                    value="maya"
                    checked={paymentMethod === "maya"}
                    onChange={() => setPaymentMethod("maya")}
                    id="maya-payment"
                  />
                </Form.Group>

                {paymentMethod === "gcash" && (
                  <div className="payment-details gcash-details">
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>GCash Number</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="paymentNumber"
                            placeholder="09XX XXX XXXX"
                            value={formData.paymentNumber}
                            onChange={handleChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide your GCash number.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Account Name</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="accountName"
                            placeholder="Full Name as registered in GCash"
                            value={formData.accountName}
                            onChange={handleChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide the account name.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {paymentMethod === "maya" && (
                  <div className="payment-details maya-details">
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Maya Account Number</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="paymentNumber"
                            placeholder="09XX XXX XXXX"
                            value={formData.paymentNumber}
                            onChange={handleChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide your Maya account number.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Account Name</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="accountName"
                            placeholder="Full Name as registered in Maya"
                            value={formData.accountName}
                            onChange={handleChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide the account name.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                <div className="d-grid gap-2 mt-4">
                  <Button variant="primary" type="submit" size="lg">
                    Place Order
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm order-summary">
            <Card.Body>
              <h3 className="mb-3">Order Summary</h3>
              {cartItems.map((item) => (
                <div
                  className="d-flex justify-content-between mb-2"
                  key={item.id}
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between total-section">
                <h4>Total</h4>
                <h4>${getTotalPrice()}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Order;
