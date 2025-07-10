import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  // ⭐ Render star rating (up to 5 stars)
  const renderStars = (rating = 0) => {
    const fullStars = Math.round(rating);
    return (
      <div
        className="text-warning mb-2"
        style={{ cursor: 'pointer', fontSize: '1.25rem' }}
        onClick={() => navigate(`/reviews/${product.id}`)}
        title="Click to see reviews"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>{i < fullStars ? '★' : '☆'}</span>
        ))}
        <span className="ms-2 text-dark small">
          ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
        </span>
      </div>
    );
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
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!product) {
    return <div className="alert alert-warning">Product not found.</div>;
  }

  // Optional: Calculate average rating from reviews
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="container my-5">
      <h2>{product.name}</h2>

      <img
        src={product.imageUrls?.[0]}
        alt={product.name}
        className="img-fluid"
        style={{ height: '400px', objectFit: 'cover' }}
      />

      {renderStars(averageRating)}

      <p>{product.description}</p>

      <p><strong>Price: </strong>R{product.price.toFixed(2)}</p>
      <p><strong>Brand: </strong>{product.brand}</p>
      <p><strong>Model: </strong>{product.model}</p>
      <p><strong>Condition: </strong>{product.condition.replace('_', ' ')}</p>
      <p><strong>Stock Quantity: </strong>{product.stockQuantity}</p>

      <div className="d-flex flex-column gap-2 mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/review/${product.id}`)}
        >
          Write a Review
        </button>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-success w-100"
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
