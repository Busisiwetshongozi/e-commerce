import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

const GetOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error('You must be signed in to view your orders.');
        }

        const idToken = await user.getIdToken();

        const response = await fetch('http://localhost:8080/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch orders.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Orders</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="alert alert-info" role="alert">
          You have no orders yet.
        </div>
      )}

      {orders.map((order, idx) => (
        <div key={order.id || idx} className="card mb-4">
          <div className="card-header">
            <strong>Order ID:</strong> {order.id || 'N/A'}<br />
            <strong>Date:</strong> {new Date(order.order_date).toLocaleString()}
          </div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              {order.items?.map((item, i) => (
                <li key={i} className="list-group-item">
                  <strong>Product ID:</strong> {item.productId} &nbsp;
                  <strong>Quantity:</strong> {item.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              <strong>Status:</strong> {order.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GetOrder;
