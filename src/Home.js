import React from 'react';
import './Home.css';
import { useAuth } from './auth/AuthContext';
import { Link } from 'react-router-dom'; // Changed from <a> tags for better SPA behavior



export default function Home() {
  const { currentUser, backendUser, logout } = useAuth(); // Added backendUser and logout
  console.log("backendUser:", backendUser);
  return (
    <div className="home">
      {/* Header Section */}
      <header className="header">
        <div className="logo">
        <h1>
          {currentUser ? (
            <>
              Welcome {backendUser?.name}! <br />
          
            </>
          ) : (
            'Welcome to the Best E-commerce Store'
          )}
        </h1>
        </div>
        <nav className="nav">
          {!currentUser ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          ) : (
            <button 
              onClick={logout} 
              className="nav-link logout-btn"
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>
          {currentUser ? (
            <>
              Hello {backendUser?.name || 'there'}! <br />
              Ready to shop?
            </>
          ) : (
            'Welcome to the Best E-commerce Store'
          )}
        </h2>
        <p>Discover amazing products at unbeatable prices!</p>
        <button className="shop-now-btn">
          {currentUser ? 'Continue Shopping' : 'Shop Now'}
        </button>
      </section>

      {/* Product Grid Section */}
      <section className="products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {[1, 2, 3, 4].map((product) => (
            <div className="product-card" key={product}>
              <img 
                src={`https://via.placeholder.com/200?text=Product+${product}`} 
                alt={`Product ${product}`} 
              />
              <h3>Product {product}</h3>
              <p>${19.99 + (product * 10)}.99</p>
              <button>
                {currentUser ? 'Add to Cart' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Shopify, All Rights Reserved</p>
        {currentUser && (
          <p className="user-email">Logged in as: {currentUser.email}</p>
        )}
      </footer>
    </div>
  );
}