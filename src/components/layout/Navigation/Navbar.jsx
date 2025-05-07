import { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Modal,
  Table,
  NavDropdown,
  OverlayTrigger,
  Tooltip,
  Image,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../styles/Navbar.css";
import Logo from "../../../assets/images/logo.svg";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";

export default function NavigationBar() {
  const [showCart, setShowCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getItemCount,
  } = useCart();

  // Handle scroll effect - updated to make navbar transparent at top
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCloseCart = () => setShowCart(false);
  const handleShowCart = (e) => {
    e.preventDefault();
    setShowCart(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const itemCount = getItemCount();

  // Menu categories
  const menuCategories = [
    { name: "Burgers", path: "/menu#burgers" },
    { name: "Sides", path: "/menu#sides" },
    { name: "Beverages", path: "/menu#beverages" },
  ];

  const handleContinueShopping = () => {
    setShowCart(false);
    navigate("/menu");
  };

  // Image error handler
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/80x80?text=Food";
  };

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return "User";

    console.log("User object in navbar:", user);

    // If user has user_data (nested format from JWT token)
    if (user.user_data) {
      if (user.user_data.name) return user.user_data.name;
      if (user.user_data.first_name) {
        return (
          user.user_data.first_name +
          (user.user_data.last_name ? " " + user.user_data.last_name : "")
        );
      }
      // Email fallback with username extraction (before the @ symbol)
      return user.user_data.email ? user.user_data.email.split("@")[0] : "User";
    }

    // Direct properties (non-nested format)
    if (user.name) return user.name;
    if (user.first_name) {
      return user.first_name + (user.last_name ? " " + user.last_name : "");
    }

    // If we have a user object with email, extract the username part
    if (user.email) return user.email.split("@")[0];

    // If user data exists in a user property (another possible nesting)
    if (user.user) {
      if (user.user.name) return user.user.name;
      if (user.user.first_name) {
        return (
          user.user.first_name +
          (user.user.last_name ? " " + user.user.last_name : "")
        );
      }
      return user.user.email ? user.user.email.split("@")[0] : "User";
    }

    // Ultimate fallback
    return "User";
  };

  return (
    <>
      <Navbar
        expand="lg"
        className={`navbar-custom ${
          scrolled ? "navbar-scrolled" : "navbar-transparent"
        }`}
        variant={scrolled ? "light" : "dark"}
      >
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Toggle aria-controls="navbar-nav" className="order-1">
            <i className="bi bi-list"></i>
          </Navbar.Toggle>
          <Navbar.Brand
            as={Link}
            to="/"
            className="mx-auto order-0 flex-grow-0 position-absolute start-50 translate-middle-x"
          >
            <img src={Logo} alt="Logo" className="react-logo" />
          </Navbar.Brand>
          <div className="invisible order-2">
            <i className="bi bi-list"></i>
          </div>
          <Navbar.Collapse id="navbar-nav" className="order-3 w-100">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/about">
                About Us
              </Nav.Link>
              <Nav.Item className="nav-item dropdown">
                <Nav.Link
                  className="dropdown-toggle"
                  id="menu-dropdown"
                  as={Link}
                  to="/menu"
                >
                  Menu
                </Nav.Link>
                <div className="dropdown-menu">
                  <Link to="/menu" className="dropdown-item">
                    View All
                  </Link>
                  <div className="dropdown-divider"></div>
                  {menuCategories.map((category, index) => (
                    <Link
                      key={index}
                      to={category.path}
                      className="dropdown-item"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </Nav.Item>
              <Nav.Link as={Link} to="/rateus">
                Rate Us
              </Nav.Link>
            </Nav>
            <Nav>
              {/* Shopping Cart Icon */}
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Shopping Cart</Tooltip>}
              >
                <Button
                  variant="link"
                  className={`cart-link me-3 border border-2 rounded p-2 position-relative ${
                    !scrolled ? "text-white border-white" : ""
                  }`}
                  onClick={handleShowCart}
                >
                  <i className="bi bi-cart3 fs-5"></i>
                  {itemCount > 0 && (
                    <span className="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </OverlayTrigger>

              {/* Order Now Button */}
              <Nav.Link
                as={Link}
                to="/order"
                className="order-now-link rounded me-3"
              >
                Order Now
              </Nav.Link>

              {/* Authentication Section */}
              {isAuthenticated ? (
                <NavDropdown
                  title={
                    <div
                      className={`d-inline-block ${
                        !scrolled ? "text-white" : ""
                      }`}
                    >
                      <i className="bi bi-person-circle fs-5"></i>
                      <span className="ms-1 d-none d-md-inline">
                        {getUserDisplayName()}
                      </span>
                    </div>
                  }
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    My Orders
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  {/* Login Icon */}
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Login</Tooltip>}
                  >
                    <Nav.Link
                      as={Link}
                      to="/login"
                      className={`me-2 p-2 border border-2 rounded ${
                        !scrolled ? "text-white border-white" : ""
                      }`}
                    >
                      <i className="bi bi-box-arrow-in-right fs-5"></i>
                    </Nav.Link>
                  </OverlayTrigger>

                  {/* Signup Icon */}
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Sign Up</Tooltip>}
                  >
                    <Nav.Link
                      as={Link}
                      to="/signup"
                      className={`p-2 border border-2 rounded ${
                        !scrolled ? "text-white border-white" : ""
                      }`}
                    >
                      <i className="bi bi-person-plus fs-5"></i>
                    </Nav.Link>
                  </OverlayTrigger>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Shopping Cart Modal */}
      <Modal show={showCart} onHide={handleCloseCart} backdrop="static">
        <Modal.Header closeButton className="bg-white border-bottom-0">
          <Modal.Title>
            <i className="bi bi-cart3 me-2"></i>
            Your Cart
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-white">
          {cartItems.length === 0 ? (
            <div className="empty-cart text-center py-5">
              <i className="bi bi-cart-x empty-cart-icon"></i>
              <h5 className="mt-3">Your cart is empty</h5>
              <p className="text-muted mb-4">
                Add some delicious items from our menu
              </p>
              <Button variant="primary" onClick={handleContinueShopping}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <Row className="align-items-center">
                    <Col xs={3} md={2} className="mb-2 mb-md-0">
                      <div className="cart-item-img-container">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="cart-item-img"
                            onError={handleImageError}
                            rounded
                          />
                        ) : (
                          <div className="placeholder-img">
                            <i className="bi bi-image"></i>
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={9} md={4}>
                      <h6 className="cart-item-name mb-1">{item.name}</h6>
                      <p className="cart-item-price">
                        ₱{parseFloat(item.price).toFixed(2)}
                      </p>
                    </Col>
                    <Col xs={6} md={3} className="my-2 my-md-0">
                      <div className="quantity-selector d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-circle quantity-btn"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </Button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-circle quantity-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <i className="bi bi-plus"></i>
                        </Button>
                      </div>
                    </Col>
                    <Col xs={4} md={2} className="text-end">
                      <span className="cart-item-total fw-bold">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </Col>
                    <Col xs={2} md={1} className="text-center">
                      <Button
                        variant="link"
                        className="text-danger remove-item-btn p-0"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}

              <div className="cart-summary mt-4">
                <Row className="fw-bold">
                  <Col xs={8} className="text-end">
                    Total:
                  </Col>
                  <Col xs={4} md={3} className="text-end pe-4">
                    ₱{getTotalPrice()}
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal.Body>

        {cartItems.length > 0 && (
          <Modal.Footer className="justify-content-between bg-white border-top-0">
            <Button
              variant="outline-secondary"
              onClick={handleContinueShopping}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </Button>
            <Button
              variant="primary"
              as={Link}
              to="/order"
              onClick={handleCloseCart}
              className="checkout-btn"
            >
              Proceed to Checkout
              <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
}
