import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import '../../styles/Auth.css';
import Logo from "../../assets/images/logo.svg";

const LoginPage = () => { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const redirectPath = location.state?.from?.pathname || "/";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="auth-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <img src={Logo} alt="Lillies Food Shop Logo" className="auth-logo mb-3" />
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Log in to your account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
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

                <Button variant="primary" type="submit" disabled={loading} className="w-100 py-2">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Form>
              <p className="mt-3 text-center">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary">Sign up here</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;