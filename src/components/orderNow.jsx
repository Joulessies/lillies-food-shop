import React from 'react'
import Marquee from 'react-fast-marquee'

const orderNow = () => {
  return (
    <div>orderNow</div><div className="order-now-section">
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
  )
}

export default orderNow