import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams(); // Extract product ID from the URL
  const navigate = useNavigate(); // Use navigate for programmatic routing
  const [product, setProduct] = useState(null); // Store the product data
  const [reviews, setReviews] = useState([]); // Store the product reviews
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Fetch product data when component mounts or product ID changes
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
        setReviews(data.reviews || []); // Set reviews from product data
      } catch (err) {
        setError(err.message); // Set error if fetch fails
      } finally {
        setIsLoading(false); // End loading
      }
    };

    if (id) fetchProduct();
  }, [id]);

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

  return (
    <div className="container my-5">
      <h2>{product.name}</h2>

      {/* Display product image */}
      <img
        src={product.imageUrls?.[0]} 
        alt={product.name}
        className="img-fluid"
        style={{ height: '400px', objectFit: 'cover' }}
      />

      {/* Product Description */}
      <p>{product.description}</p>

      {/* Price and other info */}
      <p><strong>Price: </strong>${product.price.toFixed(2)}</p>
      <p><strong>Brand: </strong>{product.brand}</p>
      <p><strong>Model: </strong>{product.model}</p>
      <p><strong>Condition: </strong>{product.condition.replace('_', ' ')}</p>
      <p><strong>Stock Quantity: </strong>{product.stockQuantity}</p>

      {/* Additional details */}
      <div className="d-flex flex-column gap-2 mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(`/reviews/${product.id}`)}
        >
          See Reviews
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/review/${product.id}`)}
        >
          Write a Review
        </button>
      </div>



      {/* Add to Cart Button */}
      <div className="mt-4">
        <button
          className="btn btn-success w-100"
          onClick={() => alert(`${product.name} added to cart!`)} // You can replace this with actual cart logic
          disabled={product.stockQuantity === 0}
        >
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;