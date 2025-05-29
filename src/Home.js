import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './auth/AuthContext';
import './Home.css';

const MIN_CHARS_FOR_SUGGESTIONS = 2;

const DiscountPriceDisplay = ({ price, discountPercentage }) => {
  const discountedPrice = price * (1 - discountPercentage / 100);
  return (
    <div className="price-display">
      <div className="discount-badge">
        <span className="badge bg-danger">{discountPercentage}% OFF</span>
      </div>
      <div className="price-comparison">
        <span className="original-price">Was: R{price.toFixed(2)}</span>
        <span className="discounted-price">Now: R{discountedPrice.toFixed(2)}</span>
      </div>
      <div className="you-save">You save: R{(price - discountedPrice).toFixed(2)}</div>
    </div>
  );
};

const RegularPriceDisplay = ({ price }) => {
  return <div className="regular-price">R{price.toFixed(2)}</div>;
};

export default function Home() {
  const { currentUser, backendUser, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Product states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products on category change
  useEffect(() => {
    fetchProducts(selectedCategoryId);
  }, [selectedCategoryId]);

  const fetchProducts = async (categoryId = '') => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:8080/api/products';
      if (categoryId) url = `http://localhost:8080/api/products/category/${categoryId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (query) => {
    if (query.length < MIN_CHARS_FOR_SUGGESTIONS) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = query.toLowerCase();
    const suggestions = products
      .filter(p => p.name.toLowerCase().includes(lower) || p.brand?.toLowerCase().includes(lower))
      .map(p => p.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);
    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  let searchTimeout;
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => generateSuggestions(query), 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(suggestion.toLowerCase()) ||
      p.brand?.toLowerCase().includes(suggestion.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'NEW': return 'success';
      case 'REFURBISHED': return 'warning';
      case 'USED_GOOD': return 'secondary';
      default: return 'primary';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home container my-5">
      {/* Header with welcome and nav */}
      <header className="header d-flex justify-content-between align-items-center mb-4">
        <h1>
          {currentUser
            ? `Welcome ${backendUser?.name || 'User'}!`
            : 'Welcome to the Best E-commerce Store'}
        </h1>
        <nav>
          {!currentUser ? (
            <>
              <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          ) : (
            <button onClick={logout} className="btn btn-danger">Logout</button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero mb-4">
        <h2>{currentUser ? `Hello ${backendUser?.name || 'there'}! Ready to shop?` : 'Welcome to the Best E-commerce Store'}</h2>
        <p>Discover amazing products at unbeatable prices!</p>
        <button
          className="btn btn-primary"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        >
          {currentUser ? 'Continue Shopping' : 'Shop Now'}
        </button>
      </section>

      {/* Search and category filters */}
      <div className="mb-4 position-relative" ref={searchRef}>
        <label htmlFor="searchInput" className="form-label">Search Products:</label>
        <div className="input-group">
          <input
            id="searchInput"
            type="text"
            className="form-control"
            placeholder="Search by name, brand or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= MIN_CHARS_FOR_SUGGESTIONS && setShowSuggestions(true)}
          />
          <button className="btn btn-primary" onClick={handleSearchSubmit}>Search</button>
        </div>
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="suggestions-dropdown border bg-white position-absolute w-100 zindex-10">
            {searchSuggestions.map((s, i) => (
              <div
                key={i}
                className="suggestion-item p-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSuggestionClick(s)}
                onKeyDown={e => e.key === 'Enter' && handleSuggestionClick(s)}
                tabIndex={0}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="categoryFilter" className="form-label">Filter by Category:</label>
        <select
          id="categoryFilter"
          className="form-select"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {error && <div className="alert alert-danger">Error loading products: {error}</div>}
        {!error && filteredProducts.length === 0 && (
          <p>No products found matching your criteria.</p>
        )}
        {filteredProducts.map(product => (
          <div className="col" key={product.id}>
            <div
              className="card h-100 shadow-sm"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {product.imageUrls?.[0] && (
                <img
                  src={product.imageUrls[0]}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <span className={`badge bg-${getConditionColor(product.condition)} mb-2`}>
                  {product.condition.replace('_', ' ')}
                </span>
                <h5 className="card-title">{product.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  {product.brand} {product.model}
                </h6>

                <div className="product-pricing">
                  {product.discountPercentage > 0 ? (
                    <DiscountPriceDisplay
                      price={product.price}
                      discountPercentage={product.discountPercentage}
                    />
                  ) : (
                    <RegularPriceDisplay price={product.price} />
                  )}
                </div>

                <p className="card-text text-truncate">{product.description}</p>
              </div>
              <div className="card-footer bg-transparent d-flex flex-column gap-2">
                <button
                  className="btn btn-success w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                    alert(`${product.name} added to cart!`);
                  }}
                  disabled={product.stockQuantity === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer mt-5 text-center">
        <p>&copy; {new Date().getFullYear()} Shopify, All Rights Reserved</p>
        {currentUser && (
          <p className="user-email">Logged in as: {currentUser.email}</p>
        )}
      </footer>
    </div>
  );
}