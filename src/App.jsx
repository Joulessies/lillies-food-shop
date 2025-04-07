import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navigation/Navbar";
import LandingPage from "./components/LandingPage";
import LandingPageContent from "./components/LandingPageContent";
import About from "./components/pages/About";
import Menu from "./components/pages/Menu";
import RateUs from "./components/pages/RateUs";
import Order from "./components/pages/Order";
import Footer from "./components/layout/Footer/Footer";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="app-container">
          <div className="navbar-container">
            <Navbar />
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <main>
                  <div className="landing-page">
                    <LandingPage />
                  </div>
                  <div>
                    <LandingPageContent />
                  </div>
                </main>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/rateus" element={<RateUs />} />
            <Route path="/order" element={<Order />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
