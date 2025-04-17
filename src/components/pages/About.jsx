import React from "react";
import { Container, Row, Col, Accordion } from "react-bootstrap";
import Marquee from "react-fast-marquee";
import FeaturedCarousel from "../Swiper";

import "../../styles/AboutUsContent.css";

const faqItems = [
  {
    question: "Why did you name it Lillies?",
    answer:
      "The name 'Lillies Food Shop' was inspired by the elegance and purity of lily flowers. Just like lilies represent beauty and freshness in nature, our food shop aims to deliver fresh, quality meals prepared with care. The name also symbolizes our commitment to offering a pure and authentic dining experience.",
  },
  {
    question: "What is the inspiration?",
    answer:
      "Our inspiration comes from traditional home cooking combined with modern culinary techniques. We were inspired by the warmth of family meals and the joy of sharing delicious food with loved ones. Each dish at Lillies is crafted with this inspiration in mind - bringing comfort, quality, and care to every plate we serve.",
  },
  {
    question: "Did you have a hard time making the website?",
    answer:
      "Creating this website was both challenging and rewarding. As students of the Technological Institute of the Philippines, we faced several hurdles including integrating various technologies, ensuring responsive design, and implementing secure payment systems. However, these challenges provided valuable learning experiences in web development, database management, and user experience design.",
  },
  {
    question: "What is a wireframe?",
    answer:
      "A wireframe is a basic visual representation of a website's layout and structure. It's essentially a blueprint that shows the placement of elements without detailed design elements like colors or images. For our Lillies Food Shop website, we created wireframes to plan the user interface, ensuring a logical flow from browsing menu items to checkout.",
  },
  {
    question: "What is user testing?",
    answer:
      "User testing is the process of evaluating a product or service by testing it with representative users. For Lillies Food Shop, we conducted user testing sessions where participants navigated through our website, placed orders, and provided feedback. This helped us identify usability issues, improve the interface, and enhance the overall customer experience before the final launch.",
  },
];

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
                  improves customer engagement while providing us hands-on
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
            {[...Array(3)].map((_, i) => (
              <Col md={4} key={i}>
                <div className="feature-box">
                  <p>Some text and Icon</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <div className="best-selling-orders">
        <h1>Most Ordered</h1>
        <FeaturedCarousel />
      </div>

      <div className="frequently-asked-questions">
        <div className="faq-section">
          <Container>
            <h2 className="text-center mb-5 text-white">
              Frequently Asked Questions
            </h2>
            <Accordion defaultActiveKey="0" className="faq-accordion">
              {faqItems.map((item, index) => (
                <Accordion.Item
                  key={index}
                  eventKey={index.toString()}
                  className="mb-3"
                >
                  <Accordion.Header>{item.question}</Accordion.Header>
                  <Accordion.Body>{item.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </div>
      </div>

      <div className="order-now-section">
        <div className="marquee-order-now">
          <Marquee
            speed={60}
            gradient={false}
            direction="right"
            pauseOnHover={true}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="order-now-marquee-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  padding: "0 2rem",
                }}
              >
                <span className="order-now-text">ORDER NOW</span>
                <button className="order-now-btn">ORDER NOW</button>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </>
  );
};

export default About;
