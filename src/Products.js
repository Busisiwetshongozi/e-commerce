import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './App.css';

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
  const [discountInputs, setDiscountInputs] = useState({});

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const MIN_CHARS_FOR_SUGGESTIONS = 2;

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

  const handleInputChange = (productId, value) => {
    setDiscountInputs((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleApplyDiscount = async (productId, discountValue) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/products/${productId}/discount?percent=${discountValue}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update discount');
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, discountPercentage: Number(discountValue) }
            : product
        )
      );

      setFilteredProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, discountPercentage: Number(discountValue) }
            : product
        )
      );
    } catch (err) {
      alert(`Error updating discount: ${err.message}`);
    }
  };

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

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="col">
            <div
              className="card h-100 shadow-sm"
              onClick={() => navigate(`/product/${product.id}`)}
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
                <span
                  className={`badge mb-2 ${
                    product.condition === 'new'
                      ? 'bg-success'
                      : product.condition === 'used'
                      ? 'bg-warning text-dark'
                      : product.condition === 'damaged'
                      ? 'bg-danger'
                      : 'bg-secondary'
                  }`}
                >
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

                <div className="discount-controls mt-3">
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Discount %"
                      min="1"
                      max="90"
                      value={discountInputs[product.id] ?? product.discountPercentage ?? ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleInputChange(product.id, e.target.value)}
                    />
                    <button
                      className={`btn ${
                        product.discountPercentage > 0 ? 'btn-outline-danger' : 'btn-outline-primary'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const value = discountInputs[product.id] || 0;
                        handleApplyDiscount(product.id, value);
                      }}
                    >
                      {product.discountPercentage > 0 ? 'Update' : 'Apply'}
                    </button>
                    {product.discountPercentage > 0 && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyDiscount(product.id, 0);
                          handleInputChange(product.id, '');
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
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
    </div>
  );
};

export default Products;