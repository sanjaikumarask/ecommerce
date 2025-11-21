import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CategoriesDropdown from "./CategoriesDropdown";
import MiniCart from "./MiniCart";
import SearchBar from "./SearchBar";
import { getCurrentUserFromToken } from "../utils/auth"; // small helper we include below
import "./Header.css";

const Header = () => {
  const { cartCount } = useCart();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    setAuthUser(getCurrentUserFromToken());
  }, []);

  // active when path starts with
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLinkClick = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setAuthUser(null);
    // optionally reload cart/auth sensitive data
    window.location.href = "/";
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="left-section">
          <button
            className={`mobile-menu-toggle ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="logo">
            <Link to="/" onClick={handleLinkClick}>MyStore</Link>
          </div>

          <nav className={`main-nav ${isMenuOpen ? "open" : ""}`}>
            <ul>
              <li>
                <Link to="/" onClick={handleLinkClick} className={isActive("/") ? "active" : ""}>Home</Link>
              </li>
              <li>
                <Link to="/products" onClick={handleLinkClick} className={isActive("/products") ? "active" : ""}>Products</Link>
              </li>
              <li>
                <CategoriesDropdown onSelect={handleLinkClick} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="center-section">
          <SearchBar />
        </div>

        <div className="right-section">
          <div className="auth-block">
            {authUser ? (
              <>
                <Link to="/profile" className="profile-link">Hi, {authUser.username}</Link>
                <button className="btn-link logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-link">Login</Link>
                <Link to="/register" className="btn-link">Register</Link>
              </>
            )}
          </div>

          <div className="cart-block">
            <button
              className="cart-btn"
              onClick={() => setIsMiniCartOpen((s) => !s)}
              aria-label="Open cart"
            >
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <MiniCart open={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
