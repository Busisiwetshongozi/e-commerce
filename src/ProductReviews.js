// src/ProductReviews.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductReviews = () => {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch product info (optional but nice)
    fetch(`http://localhost:8080/api/products/${productId}`)
      .then(res => res.json())
      .then(setProduct)
      .catch(err => setError("Failed to load product"));

    // Fetch reviews
    fetch(`http://localhost:8080/api/reviews/${productId}/reviews`)
      .then(res => res.json())
      .then(setReviews)
      .catch(err => setError("Failed to load reviews"));
  }, [productId]);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-5">
      <h2>Reviews for {product?.name || 'Product'}</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="list-group">
          {reviews.map((review, index) => (
            <li key={index} className="list-group-item">
            <p><strong>{review.name}</strong> says: {review.content}</p>

              <span className="text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              <p>{review.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductReviews;
