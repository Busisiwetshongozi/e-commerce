import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './Products.css'


const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const MIN_CHARS_FOR_SUGGESTIONS = 2;

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch categories on mount
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

  // Fetch products by category (initial or when category changes)
  useEffect(() => {
    fetchProducts(selectedCategoryId);
  }, [selectedCategoryId]);

  const fetchProducts = async (categoryId = '') => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:8080/api/products';
      if (categoryId) {
        url = `http://localhost:8080/api/products/category/${categoryId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate suggestions from existing products
  const generateSuggestions = (query) => {
    if (query.length < MIN_CHARS_FOR_SUGGESTIONS) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    
    const suggestions = products
      .filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.brand?.toLowerCase().includes(lowerCaseQuery)
      )
      .map(product => product.name)
      .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
      .slice(0, 5); // Limit to 5 suggestions
    
    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    const timer = setTimeout(() => {
      generateSuggestions(query);
    }, 200);
    
    return () => clearTimeout(timer);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(suggestion.toLowerCase()) || 
      p.brand?.toLowerCase().includes(suggestion.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    if (searchQuery.length === 0) {
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

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
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

  if (error) {
    return <div className="alert alert-danger">Error loading products: {error}</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">All Products</h2>

      {/* Enhanced Search Bar with Dropdown */}
      <div className="mb-4 position-relative" ref={searchRef}>
        <label htmlFor="searchInput" className="form-label">Search Products:</label>
        <div className="input-group">
          <input
            type="text"
            id="searchInput"
            className="form-control"
            placeholder="Search by name, brand or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= MIN_CHARS_FOR_SUGGESTIONS && setShowSuggestions(true)}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearchSubmit}
          >
            Search
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {searchSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
                tabIndex={0}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="mb-4">
        <label htmlFor="categoryFilter" className="form-label">
          Filter by Category:
        </label>
        <select
          id="categoryFilter"
          className="form-select"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="col">
            <div className="card h-100 shadow-sm">
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

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs-4">${product.price.toFixed(2)}</span>
                  <span className={`badge ${product.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Storage:</span>
                    <strong>{product.storage}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Color:</span>
                    <strong>{product.color}</strong>
                  </li>
                  {product.batteryHealth > 0 && (
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Battery:</span>
                      <strong>{product.batteryHealth}%</strong>
                    </li>
                  )}
                </ul>

                <div className="mb-3">
                  <strong>Overall Rating: </strong>
                  <span className="fs-5">{getAverageRating(product.reviews)} stars</span>
                </div>

                <p className="card-text text-truncate">{product.description}</p>
              </div>

              <div className="card-footer bg-transparent d-flex flex-column gap-2">
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate(`/reviews/${product.id}`)}
                >
                  See Reviews
                </button>

                <button
                  className="btn btn-success w-100"
                  onClick={() => {
                    addToCart(product);
                    alert(`${product.name} added to cart!`);
                  }}
                  disabled={product.stockQuantity === 0}
                >
                  Add to Cart
                </button>

                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate(`/review/${product.id}`)}
                >
                  Write a Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;