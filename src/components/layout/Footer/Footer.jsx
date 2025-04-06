import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="footer-content">
          <Col xs={12} md={4} className="footer-logo">
            <a href="/" className="logo-text">
              <span className="lillies">Lillies</span>
              <span className="food">Food</span>
              <span className="shop">Shop</span>
            </a>
          </Col>
          <Col xs={12} md={4} className="footer-nav">
            <ul>
              <li>
                <a href="/about">ABOUT</a>
              </li>
              <li>
                <a href="/order">ORDER NOW</a>
              </li>
              <li>
                <a href="/menu">MENU</a>
              </li>
              <li>
                <a href="/rateus">RATEUS</a>
              </li>
            </ul>
          </Col>
          <Col xs={12} md={4} className="footer-contact">
            <p>CONTACT US: hello@lilliesfoodshop.com</p>
          </Col>
        </Row>
        <Row className="footer-bottom">
          <Col xs={12} md={6} className="footer-links">
            <ul>
              <li>
                <a href="/terms">TERMS OF SERVICE</a>
              </li>
              <li>
                <a href="/privacy">PRIVACY POLICY</a>
              </li>
              <li>
                <a href="/cookies">COOKIES</a>
              </li>
            </ul>
          </Col>
          <Col xs={12} md={6} className="footer-copyright">
            <p>© 2024, Lillies Food Shop All Rights Reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
