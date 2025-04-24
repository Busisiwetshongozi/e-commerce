import React from 'react';
import './Home.css'; // Make sure to add some styles for better look!
import { useAuth } from './auth/AuthContext'; // Import the useAuth hook

export default function Home() {
  const { currentUser } = useAuth(); // Use the useAuth hook to access the currentUser

  return (
    <div className="home">
      {/* Header Section */}
      <header className="header">
        <div className="logo">
          {/* Conditional greeting based on currentUser */}
          <h1>
            {currentUser ? `Welcome, ${currentUser.email || 'User'}` : 'Welcome to Our Store!'}
          </h1>
        </div>
        <nav className="nav">
          {/* Show login/signup links only if user is not logged in */}
          {!currentUser ? (
            <>
              <a href="/login">Login</a>
              <a href="/signup">Sign Up</a>
            </>
          ) : (
            <a href="/logout">Logout</a> // Optionally add logout link if the user is logged in
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Welcome to the Best E-commerce Store</h2>
        <p>Shop the latest products at amazing prices!</p>
        <button className="shop-now-btn">Shop Now</button>
      </section>

      {/* Product Grid Section */}
      <section className="products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          <div className="product-card">
            <img src="https://via.placeholder.com/200" alt="Product 1" />
            <h3>Product 1</h3>
            <p>$19.99</p>
            <button>Add to Cart</button>
          </div>
          <div className="product-card">
            <img src="https://via.placeholder.com/200" alt="Product 2" />
            <h3>Product 2</h3>
            <p>$29.99</p>
            <button>Add to Cart</button>
          </div>
          <div className="product-card">
            <img src="https://via.placeholder.com/200" alt="Product 3" />
            <h3>Product 3</h3>
            <p>$39.99</p>
            <button>Add to Cart</button>
          </div>
          <div className="product-card">
            <img src="https://via.placeholder.com/200" alt="Product 4" />
            <h3>Product 4</h3>
            <p>$49.99</p>
            <button>Add to Cart</button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; 2025 Shopify, All Rights Reserved</p>
      </footer>
    </div>
  );
}
