import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './auth/AuthContext';
import './App.css'

const Navbar = () => {
  const { cartItems } = useCart();
  const { backendUser, isAuthenticated } = useAuth(); // Assuming your AuthContext provides isAuthenticated
  const location = useLocation();

  const getLinkClass = (path) =>
    `nav-link${location.pathname === path ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar">
      <Link className="navbar-brand" to="/home">📱 MyStore</Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          {/* Show these links only if user is admin */}
          {backendUser?.role === 'ADMIN' && (
            <>
              <li className="nav-item">
                <Link className={getLinkClass('/products')} to="/products">
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link className={getLinkClass('/product')} to="/product">
                  Add Product
                </Link>
              </li>
              <li className="nav-item">
                <Link className={getLinkClass('/dashboard')} to="/dashboard">
                  Admin Dashboard
                </Link>
              </li>
            </>
          )}

          {/* Everyone can place orders */}
        
        </ul>

        <ul className="navbar-nav ms-auto">
          {/* Show Sign In link when not authenticated */}
          {!isAuthenticated && (
            <li className="nav-item">
              <Link className={getLinkClass('/login')} to="/login">
                Login
              </Link>
            </li>
          )}

          {/* Show user profile when authenticated */}
          {isAuthenticated && (
            <li className="nav-item">
              <Link className={getLinkClass('/profile')} to="/profile">
                👤 Profile
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link className={getLinkClass('/cart')} to="/cart">
              🛒 Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
          </li>

          {/* Show Sign Out when authenticated */}
          {isAuthenticated && (
            <li className="nav-item">
              <Link className="nav-link" to="/signout">
                Logout
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;