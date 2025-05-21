import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';

function PayButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();

  const initiatePayment = async (paymentMethod) => {
    try {
      setLoading(true);
      setError(null);
  
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Please sign in to make a payment');
      }
  
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      if (cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }
  
      const token = await user.getIdToken();
  
      // Step 1: Create the order
      const createOrderRes = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id, // or item.productId if different
            quantity: item.quantity
          }))
        }),
      });
  
      if (!createOrderRes.ok) {
        throw new Error('Failed to create order');
      }
  
      const createdOrder = await createOrderRes.json();
  
      // Step 2: Initiate payment for that order
      const paymentRes = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${createdOrder.id}/initiate-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!paymentRes.ok) {
        throw new Error('Failed to initiate payment');
      }
  
      const formHtml = await paymentRes.text();
      const newWindow = window.open('', '_blank');
      newWindow.document.write(formHtml);
      newWindow.document.close();
  
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Choose Your Payment Method</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {/* MasterCard Option */}
        <div className="col-md-6 mb-3">
          <div
            className={`card shadow-sm ${loading ? 'opacity-50' : ''}`}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            onClick={!loading ? () => initiatePayment('credit_card') : undefined}
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
            className={`card shadow-sm ${loading ? 'opacity-50' : ''}`}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            onClick={!loading ? () => initiatePayment('ewallet') : undefined}
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