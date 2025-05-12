import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import './Review.css'; // Optional: You can create a custom CSS for stars if you need

const Review = () => {
  const { productId } = useParams();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0); // Default rating is 0
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to submit a review.');
      return;
    }

    const review = {
      productId,
      userId: user.uid,
      content,
      rating
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8080/api/reviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(review)
      });

      if (response.ok) {
        navigate('/products', { state: { message: 'Review submitted successfully!' } });
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle star click
  const handleStarClick = (value) => {
    setRating(value);
  };

  // Function to render stars based on rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
          onClick={() => handleStarClick(i)}
          style={{ cursor: 'pointer', fontSize: '1.5rem' }}
        ></i>
      );
    }
    return stars;
  };

  return (
    <div className="container my-5">
      <h2>Write a Review</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="rating" className="form-label">Rating</label>
          <div className="star-rating">
            {renderStars()}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-label">Your Review</label>
          <textarea
            id="content"
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            placeholder="Write your review here"
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default Review;
