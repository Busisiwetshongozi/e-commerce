import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 for navigation
import { useCart } from './CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'NEW': return 'success';
      case 'REFURBISHED': return 'warning';
      case 'USED_GOOD': return 'secondary';
      default: return 'primary';
    }
  };

  // Helper function to get average rating of reviews
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
    return (
      <div className="alert alert-danger">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">All Products</h2>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map(product => (
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

                {/* Display the Average Rating */}
                <div className="mb-3">
                  <strong>Overall Rating: </strong>
                  <span className="fs-5">{getAverageRating(product.reviews)} stars</span>
                </div>

                <p className="card-text text-truncate">{product.description}</p>
              </div>

              {/* Reviews section and link */}
              <div className="card-footer bg-transparent d-flex flex-column gap-2">
                {/* Link to Review Page */}
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate(`/reviews/${product.id}`)} // Link to review page
                >
                  See Reviews
                </button>

                {/* Add to Cart */}
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

                {/* Navigate to Write a Review */}
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate(`/review/${product.id}`)} // Link to write a review page
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

