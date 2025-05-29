import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './auth/AuthContext';  // Import your AuthContext hook

const Navbar = () => {
  const { cartItems } = useCart();
  const { backendUser } = useAuth();  // Get backend user info including role
  const location = useLocation();

  const getLinkClass = (path) =>
    `nav-link${location.pathname === path ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
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
          <li className="nav-item">
            <Link className={getLinkClass('/order')} to="/order">
              Place Order
            </Link>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className={getLinkClass('/cart')} to="/cart">
              🛒 Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
