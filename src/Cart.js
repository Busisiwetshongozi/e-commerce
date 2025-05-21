import React from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2>Your Cart is Empty</h2>
        <Link to="/" className="btn btn-primary mt-3">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2>Your Cart</h2>
      <div className="row g-4 mt-4">
        {cartItems.map((item) => (
          <div key={item.id} className="col-md-4 col-sm-6">
            <div className="card shadow-sm border-light">
              <img
                src={item.imageUrls?.[0] || 'https://via.placeholder.com/150'}
                alt={item.name}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">
                  <strong>Price:</strong> ${item.price.toFixed(2)} x {item.quantity}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                  <span className="badge bg-success">
                    {item.quantity} item{item.quantity > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 d-flex justify-content-between">
        <button className="btn btn-danger" onClick={clearCart}>
          Clear Cart
        </button>
        <Link to="/pay" className="btn btn-success">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
