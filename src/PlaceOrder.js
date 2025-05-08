import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const PlaceOrder = () => {
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const values = [...orderItems];
    values[index][name] = name === 'quantity' || name === 'productId' ? Number(value) : value;
    setOrderItems(values);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const values = [...orderItems];
    values.splice(index, 1);
    setOrderItems(values);
  };

  const validateOrderItems = () => {
    for (const item of orderItems) {
      if (!item.productId || isNaN(item.productId) || item.productId <= 0) {
        throw new Error('Invalid Product ID');
      }
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        throw new Error('Quantity must be at least 1');
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
  
    try {
      validateOrderItems();
  
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        throw new Error('You must be signed in to place an order');
      }
  
      const idToken = await user.getIdToken();
      const firebaseUid = user.uid;
  
      const orderPayload = {
        items: orderItems,
        status: "PENDING",
        order_date: new Date().toISOString(),
      };
  
      const response = await fetch("http://localhost:8080/api/orders/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(orderPayload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order.');
      }
  
      // ✅ If successful:
      setSuccessMessage('Your order has been placed successfully!');
      setOrderItems([{ productId: '', quantity: 1 }]); // Optional: reset form
    } catch (err) {
      setError(err.message || 'Failed to place the order. Please try again.');
      console.error('Order placement error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  

  

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Place an Order</h2>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          <strong>Success!</strong> {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error!</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {orderItems.map((item, index) => (
          <div key={index} className="mb-3 card p-3">
            <div className="mb-3">
              <label htmlFor={`productId-${index}`} className="form-label">
                Product ID
              </label>
              <input
                type="number"
                id={`productId-${index}`}
                name="productId"
                value={item.productId}
                onChange={(e) => handleItemChange(index, e)}
                className="form-control"
                min="1"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`quantity-${index}`} className="form-label">
                Quantity
              </label>
              <input
                type="number"
                id={`quantity-${index}`}
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                className="form-control"
                min="1"
                required
              />
            </div>

            {orderItems.length > 1 && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => handleRemoveItem(index)}
              >
                Remove Item
              </button>
            )}
          </div>
        ))}

        <div className="d-flex justify-content-between mb-4">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleAddItem}
          >
            + Add Another Item
          </button>

          <button 
            type="submit" 
            className="btn btn-success px-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Placing Order...
              </>
            ) : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;