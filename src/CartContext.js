import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const userToken = localStorage.getItem('token'); // example token from storage

  // Helper function for fetch with auth and JSON body
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
    };
    const opts = { headers, ...options };
    if (options.body && typeof options.body !== 'string') {
      opts.body = JSON.stringify(options.body);
    }
    const response = await fetch(url, opts);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errText}`);
    }
    return response.json();
  };

  // Load cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      if (!userToken) {
        const saved = localStorage.getItem('cart');
        setCartItems(saved ? JSON.parse(saved) : []);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/api/cart');
        setCartItems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch cart from backend', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userToken]);

  // Sync to localStorage for guests
  useEffect(() => {
    if (!userToken) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, userToken]);

  // Add or update item
  const addToCart = async (product, quantity = 1) => {
    if (!userToken) {
      setCartItems(prevItems => {
        const existing = prevItems.find(item => item.id === product.id);
        if (existing) {
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { ...product, quantity }];
      });
    } else {
      try {
        const data = await fetchWithAuth('/api/cart/item', {
          method: 'POST',
          body: { productId: product.id, quantity }
        });
        setCartItems(data.items);
      } catch (error) {
        console.error('Failed to add item to cart', error);
      }
    }
  };

  // Remove item
  const removeFromCart = async (id) => {
    if (!userToken) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      try {
        const data = await fetchWithAuth(`/api/cart/item/${id}`, {
          method: 'DELETE'
        });
        setCartItems(data.items);
      } catch (error) {
        console.error('Failed to remove item', error);
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!userToken) {
      setCartItems([]);
    } else {
      try {
        await fetchWithAuth('/api/cart/clear', {
          method: 'DELETE'
        });
        setCartItems([]);
      } catch (error) {
        console.error('Failed to clear cart', error);
      }
    }
  };

  // Price calc helpers (same as before)
  const calculateDiscountedPrice = (item) => {
    if (item.discountPercentage > 0) {
      return item.price * (1 - item.discountPercentage / 100);
    }
    return item.price;
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (calculateDiscountedPrice(item) * item.quantity),
      0
    );
  };

  const getCartTotals = () => {
    return cartItems.reduce(
      (totals, item) => {
        const discountedPrice = calculateDiscountedPrice(item);
        return {
          originalTotal: totals.originalTotal + (item.price * item.quantity),
          discountedTotal: totals.discountedTotal + (discountedPrice * item.quantity)
        };
      },
      { originalTotal: 0, discountedTotal: 0 }
    );
  };

  const validateCart = () => {
    if (cartItems.length === 0) return { isValid: false, error: "Cart is empty" };
    
    const invalidItems = cartItems.filter(
      item => !item.id || !item.price || item.quantity <= 0
    );
    
    if (invalidItems.length > 0) {
      return { 
        isValid: false, 
        error: `Invalid items: ${invalidItems.map(i => i.id).join(', ')}`
      };
    }
    
    return { isValid: true };
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart,
      getCartTotal,
      getCartTotals,
      validateCart,
      calculateDiscountedPrice,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};
