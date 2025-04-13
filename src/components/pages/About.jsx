import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../styles/AboutUsContent.css";

const About = () => {
  return (
    <>
      <div className="about-us-content">
        <Container>
          <div className="who-are-we-section">
            <Row>
              <Col md={6}>
                <h1 className="section-title">WHO ARE WE</h1>
                <div className="image-placeholder">Image</div>
                <p>
                  We are students of the Technological Institute of the
                  Philippines, developing an online platform for Lillies Food
                  Shop as part of our Platform Technologies course. This project
                  enhances the ordering experience, streamlines operations, and
                  improves customer engagement while providing us hands- on
                  experience in web development, database management, and system
                  integration.
                </p>
              </Col>
              <Col md={6}>
                <p className="quote-text">
                  "Lillies Food Shop" represents freshness, quality, and a warm
                  dining experience, bringing delicious meals to customers with
                  a touch of comfort and care. Inspired by the elegance and
                  purity of lilies, our shop is dedicated to serving food made
                  with passion, ensuring every dish is crafted with the finest
                  ingredients.
                </p>
                <h1 className="section-title">WHY LILLIES</h1>
                <div className="image-placeholder">Image</div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <div className="our-mission-section">
        <Container>
          <Row>
            <Col md={5}>
              <h1 className="mission-title">OUR MISSION</h1>
            </Col>
            <Col md={7}>
              <p className="mission-text">
                Serving good food with passion, quality, and care. At Lillies
                Food Shop, we craft delicious meals with fresh ingredients,
                ensuring a satisfying and memorable dining experience.
              </p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <div className="large-image-placeholder">Image</div>
            </Col>
          </Row>

          <Row className="mt-4 feature-boxes">
            <Col md={4}>
              <div className="feature-box">
                <p>Some text and Icon</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-box">
                <p>Some text and Icon</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-box">
                <p>Some text and Icon</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default About;
