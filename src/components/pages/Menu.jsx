import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Modal,
  Button,
  Form,
  Alert,
  Nav,
  Spinner,
} from "react-bootstrap";
import "../../styles/Menu.css";
import { useCart } from "../../context/CartContext";
import { fetchMenuCategories, fetchMenuItems } from "../../services/apiService";
// Import fallback images
import burgerFallback from "../../assets/images/Burgers/classic.avif";
import friesFallback from "../../assets/images/Fries/goldenfries.webp";
import beverageFallback from "../../assets/images/Beverages/lemonade.avif";
import defaultFallback from "../../assets/images/burgerfries.jpg";

const Menu = () => {
  const [show, setShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const audioRef = useRef(null);
  const [preloadedImages, setPreloadedImages] = useState({});

  // Create refs for each category section
  const categoryRefs = useRef({});

  const { addToCart } = useCart();

  // Create a function to properly handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null; // We'll handle fallbacks separately
    }

    // Handle relative paths from backend
    let path = imagePath;

    // If it's already a full URL, return it
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // If the image filename has an extension, it's probably a proper image path
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(path);

    // If no extension or just a simple name, it's likely a server image needs assembly
    if (!hasImageExtension || !path.includes("/")) {
      // For local development
      if (path.startsWith("products/")) {
        path = `media/${path}`;
      } else if (!path.includes("media/")) {
        path = `media/products/${path}`;
      }
    }

    // Construct full URL to the backend image with proper error handling
    try {
      const fullUrl = `http://localhost:8000/${path}`;
      return fullUrl;
    } catch (error) {
      return null;
    }
  };

  // Get category-specific fallback image
  const getCategoryFallbackImage = (item) => {
    if (!item) return defaultFallback;

    const categoryName = menuItems
      .find((cat) => cat.items.some((i) => i.id === item.id))
      ?.category.toLowerCase();

    if (categoryName?.includes("burger")) return burgerFallback;
    if (categoryName?.includes("fries") || categoryName?.includes("sides"))
      return friesFallback;
    if (categoryName?.includes("beverage") || categoryName?.includes("drink"))
      return beverageFallback;
    return defaultFallback;
  };

  // Modify the image URL logic to check preloaded cache
  const getItemImageUrl = (item) => {
    // First check if we have a preloaded result
    if (item && item.id && preloadedImages[item.id] !== undefined) {
      return preloadedImages[item.id] || getCategoryFallbackImage(item);
    }

    // Otherwise use the normal getImageUrl
    const imageUrl = getImageUrl(item?.image);
    return imageUrl || getCategoryFallbackImage(item);
  };

  // Preload images function to check if images exist
  const preloadImages = async (items) => {
    const imageCache = {};

    if (!items || items.length === 0) return;

    // Flatten all items from all categories
    const allItems = items.reduce((acc, category) => {
      return [...acc, ...(category.items || [])];
    }, []);

    // For each item, try to load its image
    for (const item of allItems) {
      if (!item.image) continue;

      const imgUrl = getImageUrl(item.image);
      if (!imgUrl) continue;

      try {
        const result = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ success: true, url: imgUrl });
          img.onerror = () => resolve({ success: false });
          img.src = imgUrl;
        });

        imageCache[item.id] = result.success ? imgUrl : null;
      } catch (error) {
        imageCache[item.id] = null;
      }
    }

    setPreloadedImages(imageCache);
  };

  // Initialize audio
  useEffect(() => {
    try {
      audioRef.current = new Audio("/success-sound.mp3");
      audioRef.current.volume = 0.5;

      // Handle audio loading
      const handleLoadError = () => {
        // Audio failed to load - silently handle
      };

      audioRef.current.addEventListener("error", handleLoadError);
      audioRef.current.load();

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("error", handleLoadError);
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    } catch (error) {
      // Audio initialization failed - silently handle
    }
  }, []);

  // Load menu data from API
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categories = await fetchMenuCategories();

        if (categories && categories.length > 0) {
          // Set first category as active by default
          setActiveCategory(categories[0].name);

          // Fetch menu items for all categories
          const items = await fetchMenuItems();

          // Organize items by category
          const organizedItems = categories.map((category) => {
            return {
              id: category.id,
              category: category.name,
              items: items.filter((item) => item.category === category.id),
            };
          });

          setMenuItems(organizedItems);

          // Preload images after setting menu items
          await preloadImages(organizedItems);
        }

        setError(null);
      } catch (err) {
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Handle scroll to track active category
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      // Find which section is currently in view
      for (const category of menuItems) {
        const element = categoryRefs.current[category.category];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveCategory(category.category);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuItems]);

  // Scroll to category section
  const scrollToCategory = (categoryName) => {
    const element = categoryRefs.current[categoryName];
    if (element) {
      const yOffset = -100; // Adjust based on your navbar height
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveCategory(categoryName);
    }
  };

  // Handle showing item detail
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
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Audio playback failed - silently handle
          });
        }
      }
    } catch (error) {
      // Audio error - silently handle
    }
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
    handleClose();
  };

  // Show loading spinner when loading data
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading menu...</p>
      </Container>
    );
  }

  // Show error message if loading failed
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Menu</Alert.Heading>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="menu-page py-5">
      {showAlert && (
        <Alert
          variant="success"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          <Alert.Heading>Success!</Alert.Heading>
          <p>{selectedItem?.name} has been added to your cart.</p>
        </Alert>
      )}
      <h1 className="text-center mb-5">Our Menu</h1>

      {/* Category Navigation */}
      <div className="category-nav-container mb-4">
        <Nav className="justify-content-center category-navigation">
          {menuItems.map((category) => (
            <Nav.Item key={category.id}>
              <Nav.Link
                className={activeCategory === category.category ? "active" : ""}
                onClick={() => scrollToCategory(category.category)}
              >
                {category.category}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {menuItems.map((category) => (
        <div
          key={category.id}
          className="menu-category mb-5"
          id={category.category.toLowerCase().replace(/\s+/g, "-")}
          ref={(el) => (categoryRefs.current[category.category] = el)}
        >
          <h2 className="category-title mb-4">{category.category}</h2>
          <Row>
            {category.items.map((item) => (
              <Col md={4} sm={6} className="mb-4" key={item.id}>
                <Card
                  className="menu-item-card h-100"
                  onClick={() => handleShow(item)}
                >
                  <Card.Img
                    variant="top"
                    src={getItemImageUrl(item)}
                    alt={item.name}
                    className="menu-image"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title>{item.name}</Card.Title>
                      <span className="menu-price">
                        ₱{parseFloat(item.price || 0).toFixed(2)}
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
                    src={getItemImageUrl(selectedItem)}
                    alt={selectedItem.name}
                    className="img-fluid modal-item-image"
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                </Col>
                <Col md={6}>
                  <h3 className="modal-item-price">
                    ₱ {parseFloat(selectedItem.price || 0).toFixed(2)}
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
                        Total: ₱
                        {(
                          parseFloat(selectedItem.price || 0) * quantity
                        ).toFixed(2)}
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
