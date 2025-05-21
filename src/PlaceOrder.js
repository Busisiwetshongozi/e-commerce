import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function PaymentSuccess() {
  const [message, setMessage] = useState('Placing your order...');
  const navigate = useNavigate();

  useEffect(() => {
    const placeOrder = async () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems'));
        if (!cartItems || cartItems.length === 0) {
          setMessage('No items found in cart.');
          return;
        }

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setMessage('User not authenticated.');
          return;
        }

        const token = await user.getIdToken();

        const orderPayload = {
          items: cartItems,
          status: 'PAID',
          order_date: new Date().toISOString()
        };

        const response = await fetch('http://localhost:8080/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
          throw new Error('Failed to place order');
        }

        setMessage('🎉 Your order has been placed successfully!');
        localStorage.removeItem('cartItems'); // Clear after success

        // Optionally redirect after a delay
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        console.error(err);
        setMessage('❌ Failed to place order after payment.');
      }
    };

    placeOrder();
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">{message}</h2>
    </div>
  );
}
