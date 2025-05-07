import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import "../../styles/Auth.css";
import Logo from "../../assets/images/logo.svg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Use login function from AuthContext
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add("auth-page-body");

    return () => {
      document.body.classList.remove("auth-page-body");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call login function from AuthContext
      await login(email, password);

      // Get the latest user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      // Always redirect regular customers to home, regardless of their staff status
      // Only staff users with explicit admin role should go to admin
      let redirectPath;
      if (userData.role === "admin" || userData.is_superuser) {
        redirectPath = "/admin";
      } else {
        // For all other users (including those with is_staff=true but no admin role),
        // redirect to home or the requested page
        redirectPath = location.state?.from?.pathname || "/";
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message ||
          "Invalid credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Container className="auth-container">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            <Card className="auth-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img
                    src={Logo}
                    alt="Lillies Food Shop Logo"
                    className="auth-logo mb-3"
                  />
                  <h2 className="auth-title">Welcome Back</h2>
                  <p className="auth-subtitle">Log in to your account</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {/* Admin credentials info */}
                <Alert variant="info" className="mb-3">
                  <strong>Demo Access Credentials:</strong>
                  <ul className="mb-0 mt-1">
                    <li>
                      <strong>Admin:</strong> <code>admin@example.com</code> /{" "}
                      <code>lilliesadmin</code>
                    </li>
                  </ul>
                  <small className="d-block mt-1 text-muted">
                    For testing purposes only
                  </small>
                </Alert>

                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formBasicPassword" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-2"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Form>
                <p className="mt-3 text-center">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary">
                    Sign up here
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <div className="wave-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            className="shape-fill"
            d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,165.3C672,171,768,149,864,149.3C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default LoginPage;
