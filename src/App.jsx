import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navigation/Navbar";
import LandingPage from "./components/LandingPage";
import LandingPageContent from "./components/LandingPageContent";
import About from "./components/pages/About";
import Menu from "./components/pages/Menu";
import RateUs from "./components/pages/RateUs";
import Order from "./components/pages/Order";
import Footer from "./components/layout/Footer/Footer";
import Login from "./components/pages/LoginPage";
import Signup from "./components/pages/SignupPage";
import Dashboard from "./components/admin/Dashboard";
import { CartProvider } from "./context/CartContext";
import { useEffect } from "react";
import lenis from "./utils/lenis";
import EmailTest from "./EmailTest";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";
import React from "react";
import { checkAdminAccess } from "./utils/adminHelper";

// Add ErrorBoundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, errorMessage: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.errorMessage}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    lenis;
  }, []);

  const isAuthenticated = true; // Replace with actual authentication logic

  return (
    <div className="app-container">
      {!isAdminRoute && (
        <div className="navbar-container">
          <Navbar />
        </div>
      )}

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
        <Route path="/home" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/rateus" element={<RateUs />} />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          }
        />
        <Route path="/email-test" element={<EmailTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin/*"
          element={
            isAuthenticated && checkAdminAccess() ? (
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            ) : (
              <Navigate
                to="/login"
                state={{ from: { pathname: "/admin" } }}
                replace
              />
            )
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
