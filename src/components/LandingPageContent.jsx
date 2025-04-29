import "../styles/LandingPageContent.css";
import { Image, Row, Col, Container, Button } from "react-bootstrap";
import FeaturedSwiper from "../components/Swiper";
import Marquee from "react-fast-marquee";
import PeopleEating1 from "../../src/assets/images/Featured/people-eating.jpg";
import PeopleEating2 from "../../src/assets/images/Featured/people-eating2.jpg";
import PeopleEating3 from "../../src/assets/images/Featured/people-eating3.jpg";
import PeopleEating4 from "../../src/assets/images/Featured/people-eating4.jpg";
import BurgerFriesDiscount from "../assets/images/Discounts/burger-fries-discount.jpg";


// Customer reviews data
const reviewsData = [
  {
    name: "John Doe",
    title: "Regular Customer",
    rating: 5,
    comment:
      "The burgers here are absolutely amazing! The quality of ingredients and the taste is unmatched. My go-to place for a delicious meal.",
    date: "March 15, 2024",
  },
  {
    name: "Sarah Smith",
    title: "Food Enthusiast",
    rating: 5,
    comment:
      "Great atmosphere and even better food! The staff is friendly and the service is quick. Love their special sauce!",
    date: "March 18, 2024",
  },
  {
    name: "Mike Johnson",
    title: "Foodie",
    rating: 5,
    comment:
      "The combo meals are perfect for sharing with friends. Great value for money and the taste is consistently good!",
    date: "March 20, 2024",
  },
  {
    name: "Emily Wilson",
    title: "First-time Visitor",
    rating: 5,
    comment:
      "Had lunch here for the first time yesterday and was blown away! The burgers are juicy and the fries are perfectly crispy.",
    date: "March 22, 2024",
  },
  {
    name: "David Brown",
    title: "Burger Lover",
    rating: 5,
    comment:
      "I've tried burgers all over town, but this place is special. The ingredients are fresh and the flavors are incredible.",
    date: "March 25, 2024",
  },
];

// Functionality: Render on the Star Ratings
export default function LandingPageContent() {
  const renderStars = (count) => {
    return "★".repeat(count);
  };

  return (
    <div>
      <div className="landing-page-content">
        <Row className="align-items-center">
          <Col md={6} className="text-content">
            <h1>
              LOCAL<span className="highlight">.</span>
            </h1>
            <h2>
              FRESH<span className="accent">,</span> DAMN
              <span className="accent">,</span> TASTY
            </h2>
            <p>
              Lillies Food Shop is a project for our Platform Technologies
              course at the Technological Institute of the Philippines. As
              students, we are exploring the most efficient ways to develop the
              website with minimal effort while maintaining quality,
              functionality, and a user-friendly experience.
            </p>
            <Button variant="primary" className="landing-page-button">
              Learn More
            </Button>
          </Col>
          <Col md={6} className="image-content">
            <div className="image-grid">
              <Image className="image-carousel" />
              <Image className="image-carousel" />
              <Image className="image-carousel" />
              <Image className="image-carousel" />
            </div>
          </Col>
        </Row>
      </div>

      {/* Best Selling */}
      <div className="best-selling">
        <h1>Best Selling</h1>
        <FeaturedSwiper />
      </div>

      {/* Featured Section */}
      <div className="featured-section" src={PeopleEating3}>
        <h1>Featured</h1>
        <div className="featured-section-grid">
          <Container>
            <Row>
              <Col>
                <Image className="featured-landing-page" src={PeopleEating2} />
                <div className="featured-text">
                  <h3>Dining Experience</h3>
                  <p>Enjoy our delicious meals in a cozy atmosphere</p>
                </div>
              </Col>
              <Col>
                <Image className="featured-landing-page" src={PeopleEating4} />
                <div className="featured-text">
                  <h3>Share with Friends</h3>
                  <p>Enjoy our delicious meals in a cozy atmosphere</p>
                </div>
              </Col>
              <Col>
                <Image className="featured-landing-page" src={PeopleEating4} />
                <div className="featured-text">
                  <h3>Share with loved ones</h3>
                  <p>Enjoy your delicious meals with your loved ones</p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <Image className="featured-landing-page" src={PeopleEating1} />
                <div className="featured-text">
                  <h3>Burger Discount</h3>
                  <p>Delicious burger at a discount</p>
                </div>
              </Col>
              <Col>
                <Image className="featured-landing-page" src={BurgerFriesDiscount} />
                <div className="featured-text">
                  <h3>French Fries Discount</h3>
                  <p>Crispy fries at a special price</p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="customer-review">
        <h1>What Our Customers Say</h1>
        <div className="review-grid">
          <Marquee speed={40} gradientWidth={50} pauseOnHover={true}>
            {reviewsData.map((review, index) => (
              <div className="review-card" key={index}>
                <div className="review-header">
                  <div className="reviewer-info">
                    <h3>{review.name}</h3>
                    <p>{review.title}</p>
                  </div>
                </div>
                <div className="review-stars">{renderStars(review.rating)}</div>
                <p className="review-text">"{review.comment}"</p>
                <p className="review-date">{review.date}</p>
              </div>
            ))}
          </Marquee>
        </div>
      </div>

      {/* Order Now Marquee */}
      <div className="order-now-section">
        <div className="marquee-order-now">
          <Marquee
            speed={60}
            gradient={false}
            direction="right"
            pauseOnHover={true}
          >
            <div
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
            <div
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
            <div
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
          </Marquee>
        </div>
      </div>
    </div>
  );
}
