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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

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
    navigate('/');
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

  return (
    <>
      <Navbar
        expand="lg"
        className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`}
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
                  className="cart-link me-3 border border-2 rounded p-2 position-relative"
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
              
              {/* Order Now Button - Moved before authentication section */}
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
                    <div className="d-inline-block">
                      <i className="bi bi-person-circle fs-5"></i>
                      <span className="ms-1 d-none d-md-inline">{user?.name || 'Account'}</span>
                    </div>
                  } 
                  id="user-dropdown" 
                >
                  <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  {/* Login Icon */}
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Login</Tooltip>}
                  >
                    <Nav.Link as={Link} to="/login" className="me-2 p-2 border border-2 rounded">
                      <i className="bi bi-box-arrow-in-right fs-5"></i>
                    </Nav.Link>
                  </OverlayTrigger>
                  
                  {/* Signup Icon */}
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Sign Up</Tooltip>}
                  >
                    <Nav.Link as={Link} to="/signup" className="p-2 border border-2 rounded">
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
      <Modal show={showCart} onHide={handleCloseCart} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Your Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.length === 0 ? (
            <p className="text-center py-4">Your cart is empty</p>
          ) : (
            <>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <div className="quantity-selector">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td>₱{(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-end">
                      Total:
                    </th>
                    <th>₱{getTotalPrice()}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleContinueShopping}>
            Continue Shopping
          </Button>
          <Button
            variant="primary"
            disabled={cartItems.length === 0}
            as={Link}
            to="/order"
            onClick={handleCloseCart}
          >
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
