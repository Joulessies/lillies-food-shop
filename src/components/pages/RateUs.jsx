import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import '../../styles/RateUs.css';

const RateUs = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <Container className="rate-us-page py-5">
      <h1 className="text-center mb-5">Rate Your Experience</h1>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="rate-us-card">
            <Card.Body>
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>Your Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your name" />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control type="email" placeholder="Enter your email" />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Your Rating</Form.Label>
                  <div className="star-rating">
                    {[...Array(5)].map((star, index) => {
                      index += 1;
                      return (
                        <button
                          type="button"
                          key={index}
                          className={
                            index <= (hover || rating) ? 'star on' : 'star off'
                          }
                          onClick={() => setRating(index)}
                          onMouseEnter={() => setHover(index)}
                          onMouseLeave={() => setHover(rating)}
                        >
                          <span className="star">&#9733;</span>
                        </button>
                      );
                    })}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Tell us about your experience"
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="primary"
                    type="submit"
                    className="submit-btn"
                  >
                    Submit Review
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col className="text-center">
          <p className="thank-you-message">
            Thank you for taking the time to share your feedback with us. Your
            opinion helps us improve our service for everyone!
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default RateUs;
