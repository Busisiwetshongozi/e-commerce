import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useCart } from './CartContext';

function PayButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const { cartItems, getCartTotal, validateCart } = useCart();

  const initiatePayment = async (paymentMethod, newWindow) => {
    try {
      setLoading(true);
      setError(null);

      // Validate user
      const user = auth.currentUser;
      if (!user) throw new Error('Please sign in to make a payment');

      // Validate cart
      const validation = validateCart();
      if (!validation.isValid) throw new Error(validation.error);

      const token = await user.getIdToken();
      const API_URL = 'http://localhost:8080';

      // Create order
      const createOrderRes = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
        }),
      });

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const createdOrder = await createOrderRes.json();

      // Initiate payment
      const paymentRes = await fetch(`${API_URL}/api/payfast/${createdOrder.id}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }

      const paymentData = await paymentRes.json();

      if (!newWindow) throw new Error('Popup blocked. Please allow popups for this site.');

      // Build form and redirect
      const form = newWindow.document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.paymentUrl;

      for (const [key, value] of Object.entries(paymentData.paymentParameters)) {
        const input = newWindow.document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = decodeURIComponent(value);
        form.appendChild(input);
      }

      newWindow.document.write('<html><body>');
      newWindow.document.body.appendChild(form);
      newWindow.document.write('<p>Redirecting to payment...</p>');
      newWindow.document.write(form.outerHTML);
      newWindow.document.write('<script>document.forms[0].submit();</script>');
      newWindow.document.write('</body></html>');
      newWindow.document.close();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError(error.message);
      if (newWindow && !newWindow.closed) newWindow.close(); // Close unused window
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (method) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      initiatePayment(method, newWindow);
    } else {
      setError('Popup blocked. Please allow popups for this site.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Checkout</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="cart-summary mb-4 p-3 border rounded">
        <h4>Order Summary</h4>
        <ul className="list-unstyled">
          {cartItems.map(item => (
            <li key={item.id} className="d-flex justify-content-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="total fw-bold d-flex justify-content-between">
          <span>Total:</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
      </div>

      <h2 className="text-center mb-4">Payment Method</h2>

      <div className="row">
        {/* MasterCard Option */}
        <div className="col-md-6 mb-3">
          <div
            className={`card shadow-sm ${loading || cartItems.length === 0 ? 'opacity-50' : ''}`}
            style={{ cursor: loading || cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
            onClick={!loading && cartItems.length > 0 ? () => handlePaymentClick('credit_card') : undefined}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mastercard_logo.svg/1200px-Mastercard_logo.svg.png"
              className="card-img-top p-4"
              alt="MasterCard"
              style={{ height: '120px', objectFit: 'contain' }}
            />
            <div className="card-body text-center">
              <h5 className="card-title">Pay with MasterCard</h5>
              <p className="card-text">Click to pay using your MasterCard credit or debit card.</p>
            </div>
          </div>
        </div>

        {/* eWallet Option */}
        <div className="col-md-6 mb-3">
          <div
            className={`card shadow-sm ${loading || cartItems.length === 0 ? 'opacity-50' : ''}`}
            style={{ cursor: loading || cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
            onClick={!loading && cartItems.length > 0 ? () => handlePaymentClick('ewallet') : undefined}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Payfast_logo.svg/1200px-Payfast_logo.svg.png"
              className="card-img-top p-4"
              alt="eWallet"
              style={{ height: '120px', objectFit: 'contain' }}
            />
            <div className="card-body text-center">
              <h5 className="card-title">Pay with eWallet</h5>
              <p className="card-text">Click to pay using your eWallet or Instant EFT services.</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Processing your payment...</p>
        </div>
      )}
    </div>
  );
}

export default PayButton;
