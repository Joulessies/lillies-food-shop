import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../../styles/About.css';

const About = () => {
  return (
    <Container className="about-page py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4">About Lillies Food Shop</h1>
          <div className="about-content">
            <p>
              Welcome to Lillies Food Shop, where we blend delicious food with a
              passion for quality and service. Our journey began with a simple
              idea: to create a place where people can enjoy fresh, tasty food
              in a welcoming environment.
            </p>
            <p>
              At Lillies, we believe that good food brings people together. Our
              menu features a variety of carefully crafted items, from juicy
              burgers to crispy fries, all made with the freshest ingredients.
            </p>
            <p>
              We are committed to providing an exceptional dining experience for
              our customers. Whether you're dining in, taking out, or ordering
              delivery, we strive to ensure that every meal is prepared with
              care and served with a smile.
            </p>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Our Mission</h2>
          <div className="mission-content">
            <p>
              Our mission at Lillies Food Shop is to provide high-quality,
              delicious food while creating a positive impact in our community.
              We are dedicated to:
            </p>
            <ul>
              <li>
                Using fresh, locally-sourced ingredients whenever possible
              </li>
              <li>Creating a welcoming atmosphere for all our customers</li>
              <li>
                Supporting our local community through various initiatives
              </li>
              <li>
                Providing exceptional service that keeps customers coming back
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="text-center mb-4">Meet Our Team</h2>
          <div className="team-content">
            <p>
              Behind every delicious meal at Lillies Food Shop is our dedicated
              team of professionals who are passionate about food and service.
              From our talented chefs to our friendly service staff, each member
              plays a crucial role in delivering the Lillies experience.
            </p>
            <p>
              We are proud of our diverse team and the unique perspectives they
              bring to our restaurant. Together, we work to create a welcoming
              environment where everyone feels at home.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
