import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
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
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate discounted price for an item
  const calculateDiscountedPrice = (item) => {
    if (item.discountPercentage > 0) {
      return item.price * (1 - item.discountPercentage / 100);
    }
    return item.price;
  };

  // Calculate cart total using discounted prices
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (calculateDiscountedPrice(item) * item.quantity),
      0
    );
  };

  // Get both original and discounted totals if needed
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
      getCartTotals, // Optional: if you need both totals
      validateCart,
      calculateDiscountedPrice // Expose if needed elsewhere
    }}>
      {children}
    </CartContext.Provider>
  );
};