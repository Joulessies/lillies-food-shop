import React from "react";
import "../styles/LandingPage.css";
import { Container, Image } from "react-bootstrap";
import Marquee from "react-fast-marquee";
import BurgerFries from "../assets/images/burgerfries.jpg";

const MARQUEE_TEXT = [
  { text: "TASTY LOCAL, FRESH,", className: "" },
  { text: "NEIGHBORHOOD BURGER JOINT", className: "outline" },
  { text: "TASTY LOCAL, FRESH,", className: "" },
  { text: "NEIGHBORHOOD BURGER JOINT", className: "outline" },
  { text: "TASTY LOCAL, FRESH,", className: "" },
  { text: "NEIGHBORHOOD BURGER JOINT", className: "outline" },
];

const VERTICAL_TEXT = [
  { text: "LOCAL", className: "" },
  { text: "FRESH", className: "outline" },
  { text: "LOCAL", className: "" },
  { text: "FRESH", className: "outline" },
  { text: "LOCAL", className: "" },
  { text: "FRESH", className: "outline" },
];

const LandingPage = () => {
  return (
    <div className="landing-hero-wrapper">
      {/* Right Vertical Marquee */}
      <div className="vertical-marquee right-vertical" style={{ right: 0 }}>
        <Marquee direction="up" speed={15} gradient={false} pauseOnHover>
          <div className="vertical-text">
            {VERTICAL_TEXT.map((item, index) => (
              <span key={index} className={item.className}>
                {item.text}
              </span>
            ))}
          </div>
        </Marquee>
      </div>
      {/* Horizontal Marquee Text Overlay */}
      <div className="marquee-overlay">
        <div className="marquee-track marquee-track-4">
          <Marquee speed={85} gradient={false} direction="right" pauseOnHover>
            <div className="marquee-content">
              {MARQUEE_TEXT.map((item, index) => (
                <span key={index} className={item.className}>
                  {item.text}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <div className="marquee-track marquee-track-3">
          <Marquee speed={70} gradient={false} pauseOnHover>
            <div className="marquee-content">
              {MARQUEE_TEXT.map((item, index) => (
                <span key={index} className={item.className}>
                  {item.text}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <div className="marquee-track marquee-track-1">
          <Marquee speed={100} gradient={false} pauseOnHover>
            <div className="marquee-content">
              {MARQUEE_TEXT.map((item, index) => (
                <span key={index} className={item.className}>
                  {item.text}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <div className="marquee-track marquee-track-2">
          <Marquee speed={100} direction="right" gradient={false}>
            <div className="marquee-content">
              {MARQUEE_TEXT.map((item, index) => (
                <span key={index} className={item.className}>
                  {item.text}
                </span>
              ))}
            </div>
          </Marquee>
        </div>
      </div>

      {/* Vertical Marquees */}
      <div className="vertical-marquee left-vertical">
        <Marquee direction="down" speed={15} gradient={false}>
          <div className="vertical-text">
            {VERTICAL_TEXT.map((item, index) => (
              <span key={index} className={item.className}>
                {item.text}
              </span>
            ))}
          </div>
        </Marquee>
      </div>

      <Container fluid className="landing-hero">
        <div className="centered-food-content">
          <div className="circular-frame">
            <Image
              src={BurgerFries}
              alt="Delicious food"
              className="food-image"
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;
